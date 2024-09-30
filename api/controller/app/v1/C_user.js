const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const user = require("../../../models/M_user");
const user_address = require("../../../models/M_user_address");
const user_session = require("../../../models/M_user_session");
const wallet_history = require("../../../models/M_wallet_history");

const {
  successRes,
  errorRes,
  multiSuccessRes,
} = require("../../../../utils/common_fun");

const { userToken } = require("../../../../utils/token");

const { sendTemporaryPassword } = require("../../../../utils/send_mail");

const { uploadFile, deleteFile } = require("../../../../utils/s3_bucket");

const {
  securePassword,
  comparePassword,
} = require("../../../../utils/secure_pwd");
const { listenerCount } = require("process");

const signUp = async (req, res) => {
  try {
    var {
      full_name,
      email_address,
      password,
      user_type,
      device_type,
      device_token,
    } = req.body;

    // var { profile_picture } = req.files;

    let find_user = await user.findOne({
      email_address: email_address,
      is_deleted: false,
    });

    if (find_user) {
      return errorRes(res, `Email is already exists`);
    }

    var insert_data = {
      user_type,
      full_name,
      email_address,
      is_active: true,
    };

    if (password) {
      const hashedPassword = await securePassword(password);

      insert_data = {
        ...insert_data,
        password: hashedPassword,
      };
    }

    var create_user = await user.create(insert_data);

    let token = await userToken(create_user);

    create_user = {
      ...create_user._doc,
      token: token,
    };

    let session = await user_session.findOneAndUpdate(
      {
        device_token: device_token,
        user_id: create_user._id,
      },
      {
        $set: {
          device_token: device_token,
          device_type: device_type,
          is_login: true,
          auth_token: token,
          user_type: user_type,
          user_id: create_user._id,
        },
      },
      { new: true, upsert: true }
    );

    return successRes(
      res,
      `Your account has been successfully created`,
      create_user
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const signIn = async (req, res) => {
  try {
    let { email_address, password, device_token, device_type } = req.body;

    console.log("req.body",req.body)

    let find_user = await user.findOne({
      email_address: email_address,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, `No account found with this email`);
    }

    var password_verify = await comparePassword(password, find_user.password);

    if (!password_verify) {
      return errorRes(res, `Your email or password wrong, please check it`);
    }

    var token = await userToken(find_user);

    var login_updated_data = await user.findOne({
      _id: find_user._id,
      is_deleted: false,
    });

    if (login_updated_data.profile_picture != null) {
      login_updated_data.profile_picture =
        process.env.BASE_URL + login_updated_data.profile_picture;
    }
    login_updated_data = {
      ...login_updated_data._doc,
      token: token,
    };

    let session = await user_session.findOneAndUpdate(
      {
        device_token: device_token,
        user_id: find_user._id,
      },
      {
        $set: {
          device_token: device_token,
          is_login: true,
          auth_token: token,
          device_type: device_type,
          user_type: find_user.user_type,
          user_id: find_user._id,
        },
      },
      { new: true, upsert: true }
    );

    return successRes(res, `You have login successfully `, login_updated_data);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const getUserDetails = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let [user_details] = await user.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(user_id),
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "addresses",
          localField: "_id",
          foreignField: "user_id",
          as: "address",
          pipeline: [
            {
              $match: {
                is_deleted: false,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$address",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          profile_picture: {
            $cond: [
              { $ifNull: ["$profile_picture", false] },
              { $concat: [process.env.S3_BUCKET_URL, "$profile_picture"] },
              null,
            ],
          },
          address: {
            $cond: [{ $ifNull: ["$address", false] }, "$address", null],
          },
        },
      },
    ]);

    if (!user_details) {
      return errorRes(res, "User not found");
    }

    return successRes(res, "User details fetched successfully", user_details);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email_address } = req.body;

    let find_user = await user.findOne({
      email_address: email_address,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, `No account found with this email`);
    }

    // Generate a random password
    const newPassword = Math.random().toString(36).substr(2, 8);

    // Hash the new password
    const hashedPassword = await securePassword(newPassword);

    // Update the user's password
    const updatePassword = await user.findByIdAndUpdate(
      find_user._id,
      {
        password: hashedPassword,
      },
      { new: true }
    );

    // Send an email with the new temp password
    const emailData = {
      emailAddress: find_user.email_address,
      name: find_user.full_name,
      password: newPassword,
    };

    sendTemporaryPassword(emailData);

    return successRes(
      res,
      `We've sent an email with your new temporary password.`
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const editProfile = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { full_name } = req.body;

    let { profile_picture } = req.files;
    console.log("req.files", req.files);

    console.log("profile_picture++++++++++++++++++", profile_picture);

    let find_user = await user.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    }

    let update_data;

    if(full_name)
    {
      update_data = {
       ...update_data,
       full_name: full_name,
      };
    }

    if (req.files != undefined) {
      if (profile_picture) {
        let file_extension = profile_picture.originalFilename
          .split(".")
          .pop()
          .toLowerCase();

        var file_name =
          Math.floor(1000 + Math.random() * 9000) +
          "_" +
          Date.now() +
          "." +
          file_extension;

        // Upload file into folder
        let oldPath = profile_picture.path;
        let newPath = "profile_picture/" + file_name;

        let oldFile = null;

        if (find_user.profile_picture != null) {
          let deletedFileData = {
            filePath: find_user.profile_picture,
          };

          await deleteFile(deletedFileData);
        }

        const fileContent = fs.readFileSync(oldPath);

        let imageData = {
          newPath: newPath,
          fileContent: fileContent,
          profile_picture_type: profile_picture.type,
        };

        const uploadProfilePicture = await uploadFile(imageData);

        let profilePicture = null;

        if (uploadProfilePicture.success) {
          profilePicture = newPath;
        }

        update_data = {
          ...update_data,
          profile_picture: profilePicture,
        };
      }
    }

    let updated_user = await user.updateOne(
      { _id: user_id },
      { $set: update_data },
      { new: true }
    );

    let [updated_user_data] = await user.aggregate([
      {
        $match: {
          _id: find_user._id,
          is_deleted: false,
        },
      },
      {
        $addFields: {
          profile_picture: {
            $cond: [
              { $ifNull: ["$profile_picture", false] },
              { $concat: [process.env.S3_BUCKET_URL, "$profile_picture"] },
              null,
            ],
          },
        },
      },
    ]);

    console.log("updated_user_data", updated_user_data);


    // return {
    //   status:true
    // }
    return successRes(
      res,
      `Profile has been updated successfully`,
      updated_user_data
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const logout = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { device_token } = req.body;

    let find_user = await user.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    }

    await user_session.deleteMany({
      user_id: find_user._id,
      device_token: device_token,
    });

    return successRes(res, "Your account is logout successfully", []);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const selfDelete = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let find_user = await user.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    }

    var update_user = await user.updateOne(
      { _id: user_id },
      {
        $set: {
          is_self_delete: true,
          is_active: false,
          is_deleted: true,
        },
      },
      { new: true }
    );

    await user_session.deleteMany({
      user_id: user_id,
    });

    return successRes(res, "Your account is deleted successfully", []);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const changePassword = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { new_password } = req.body;

    let find_user = await user.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    }

    if (new_password == null || new_password == "null") {
      return errorRes(res, `Password must be provided.`);
    }

    if (find_user.password == new_password) {
      return errorRes(res, `Your old password and new password are same.`);
    }

    const hashedPassword = await securePassword(new_password);

    let update_data = {
      password: hashedPassword,
    };

    await user.updateOne(
      {
        _id: find_user._id,
      },
      {
        $set: update_data,
      }
    );

    return successRes(res, `Your password has been updated successfully`, []);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const addCredit = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { amount } = req.body;

    let find_user = await user.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    }

    let update_data = {
      credit: parseInt(find_user.credit) + parseInt(amount),
    };

    let wallet_data = {
      user_id: find_user._id,
      amount: parseInt(amount),
      transaction_type: "credit",
    };

    await user.updateOne(
      {
        _id: find_user._id,
      },
      {
        $set: update_data,
      }
    );

    const create_wallet_hostory = await wallet_history.create(wallet_data);

    return successRes(
      res,
      `Your credit has been added successfully`,
      create_wallet_hostory
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const addAddress = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { address_name, country_code, contact_number, address, is_primary } =
      req.body;

    let find_user = await user.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    }

    if (is_primary == true || is_primary == "true") {
      let find_selected_address = await user_address.findOne({
        user_id: user_id,
        is_primary: true,
        is_deleted: false,
      });

      if (find_selected_address) {
        const edit_address = await user_address.findOneAndUpdate(
          {
            _id: find_selected_address._id,
          },
          {
            $set: {
              is_primary: false,
            },
          }
        );
      }
    }

    let insert_data = {
      user_id,
      address_name,
      country_code,
      contact_number,
      address,
      is_primary,
    };

    const add_address = await user_address.create(insert_data);

    return successRes(
      res,
      `Your address has been added successfully`,
      add_address
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const editAddress = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { address_id, country_code, contact_number, address, is_primary } =
      req.body;

    let find_user = await user.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    }

    if (is_primary == true || is_primary == "true") {
      let find_selected_address = await user_address.findOne({
        user_id: user_id,
        is_primary: true,
        is_deleted: false,
      });

      if (find_selected_address) {
        const edit_address = await user_address.findOneAndUpdate(
          {
            _id: find_selected_address._id,
          },
          {
            $set: {
              is_primary: false,
            },
          }
        );
      }
    }

    let edit_data = {
      country_code,
      contact_number,
      address,
      is_primary,
    };

    const edit_address = await user_address.findOneAndUpdate(
      {
        _id: address_id,
      },
      {
        $set: edit_data,
      }
    );

    if (edit_address) {
      const updated_address = await user_address.findOne({
        _id: address_id,
        is_deleted: false,
      });

      return successRes(
        res,
        `Your address has been changed successfully`,
        updated_address
      );
    } else {
      return errorRes(res, "Address not found");
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const getAddress = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { address_id } = req.body;

    let find_user = await user.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    }

    const get_address = await user_address.findOne({
      _id: address_id,
      // user_id: user_id,
      is_deleted: false,
    });

    return successRes(
      res,
      "Your address has been get successfully",
      get_address
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const addressList = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let find_user = await user.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    }

    const address_list = await user_address.find({
      user_id: user_id,
      is_deleted: false,
    });

    return successRes(res, "Your Address list get successfully", address_list);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const deleteAddress = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { address_id } = req.body;

    let find_user = await user.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    }

    let find_address = await user_address.findOne({
      _id: address_id,
      user_id: user_id,
      is_deleted: false,
    });

    if (!find_address) {
      return errorRes(res, "Address not found");
    }

    let delete_address = await user_address.findByIdAndUpdate(
      address_id,
      {
        $set: {
          is_deleted: true,
        },
      },
      { new: true }
    );

    return successRes(res, "Address deleted successfully", []);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const selectAddress = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { address_id } = req.body;

    let find_user = await user.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "Couldn't found user");
    }

    let find_selected_address = await user_address.findOne({
      user_id: user_id,
      is_primary: true,
      is_deleted: false,
    });

    if (find_selected_address) {
      const edit_address = await user_address.findOneAndUpdate(
        {
          _id: find_selected_address._id,
        },
        {
          $set: {
            is_primary: false,
          },
        }
      );
    }

    let edit_data = {
      is_primary: true,
    };

    const edit_address = await user_address.findOneAndUpdate(
      {
        _id: address_id,
      },
      {
        $set: edit_data,
      }
    );

    const updated_address = await user_address.findOne({
      _id: address_id,
      is_deleted: false,
    });

    return successRes(
      res,
      `Your address has selected successfully`,
      updated_address
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

module.exports = {
  signUp,
  signIn,
  getUserDetails,
  forgotPassword,
  editProfile,
  logout,
  selfDelete,
  changePassword,
  addCredit,
  addAddress,
  getAddress,
  editAddress,
  addressList,
  deleteAddress,
  selectAddress,
  addAddress,
};
