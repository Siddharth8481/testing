const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const users = require("../../../models/M_user");
const user_address = require("../../../models/M_user_address");
const box = require("../../../models/M_box");
const box_items = require("../../../models/M_box_item");
const wallet_history = require("../../../models/M_wallet_history");
const box_features = require("../../../models/M_box_features");
const box_subscription = require("../../../models/M_box_subscription");
const box_types = require("../../../models/M_box_types");

const {
  successRes,
  errorRes,
  multiSuccessRes,
} = require("../../../../utils/common_fun");

const { userToken } = require("../../../../utils/token");
const { sendTemporaryPassword } = require("../../../../utils/send_mail");

const {
  securePassword,
  comparePassword,
} = require("../../../../utils/secure_pwd");

const { uploadFile, deleteFile } = require("../../../../utils/s3_bucket");

const buyBox = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let find_user = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "User not found");
    }

    let {
      box_name,
      box_size,
      box_features_id,
      subscription,
      exipiry_date,
      box_price,
    } = req.body;

    let { box_image } = req.files;

    if (!box_image) {
      return errorRes(res, "Please upload box image");
    }

    let find_box_size = await box_types.findOne({
      _id: box_size,
      is_deleted: false,
    });

    if (!find_box_size) {
      return errorRes(res, "Box size not found");
    }

    let box_fetures_ids = JSON.parse(box_features_id);

    if (box_fetures_ids.length > 0) {
      let find_box_features_exist = await box_features.find({
        _id: { $in: box_fetures_ids },
        is_deleted: false,
      });

      if (find_box_features_exist.length != box_fetures_ids.length) {
        return errorRes(res, "Box features not found");
      }
    } else {
      // box_fetures_ids=[]
      return errorRes(res, "At least One Box feature is required");
    }

    if (box_price > find_user.credit) {
      return errorRes(res, "Insufficient credit");
    }

    let box_data = {
      user_id: user_id,
      box_name: box_name,
      box_size: box_size,
      box_features: box_fetures_ids,
      subscription: subscription,
      exipiry_date: new Date(exipiry_date),
      box_price: box_price,
    };

    if (req.files) {
      if (box_image) {
        let file_extension = box_image.originalFilename
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
        let oldPath = box_image.path;
        let newPath = "box_image/" + file_name;

        let oldFile = null;

        const fileContent = fs.readFileSync(oldPath);

        let imageData = {
          newPath: newPath,
          fileContent: fileContent,
          profile_picture_type: box_image.type,
        };

        const uploadProfilePicture = await uploadFile(imageData);

        let boxImage = null;

        if (uploadProfilePicture.success) {
          boxImage = newPath;
        }

        box_data = {
          ...box_data,
          box_image: boxImage,
        };
      }
    }

    let buy_box = await box.create(box_data);

    await users.findByIdAndUpdate(
      { _id: user_id },
      {
        $inc: {
          credit: -parseInt(box_price),
        },
      }
    );

    return successRes(res, "Box buy successfully", buy_box);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const editBox = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { box_id, box_name } = req.body;

    let { box_image } = req.files;

    let find_box = await box.findOne({
      _id: box_id,
      user_id: user_id,
      is_deleted: false,
    });

    if (!find_box) {
      return errorRes(res, "Box not found");
    }

    let data = {
      box_name: box_name,
    };

    if (req.files) {
      if (box_image) {
        let file_extension = box_image.originalFilename
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
        let oldPath = box_image.path;
        let newPath = "box_image/" + file_name;

        let oldFile = null;

        if (find_box.box_image != null) {
          let deletedFileData = {
            filePath: find_box.box_image,
          };

          await deleteFile(deletedFileData);
        }

        const fileContent = fs.readFileSync(oldPath);

        let imageData = {
          newPath: newPath,
          fileContent: fileContent,
          profile_picture_type: box_image.type,
        };

        const uploadProfilePicture = await uploadFile(imageData);

        let boxImage = null;

        if (uploadProfilePicture.success) {
          boxImage = newPath;
        }

        data = {
          ...data,
          box_image: boxImage,
        };
      }
    }

    await box.findByIdAndUpdate(
      { _id: box_id },
      {
        $set: data,
      }
    );

    let find_updated_box = await box.findOne({
      _id: box_id,
      user_id: user_id,
      is_deleted: false,
    });

    return successRes(res, "Box edited successfully", find_updated_box);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const boxDetails = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { box_id } = req.body;

    let find_box = await box.findOne({
      _id: box_id,
      user_id: user_id,
      is_deleted: false,
    });

    if (!find_box) {
      return errorRes(res, "Box not found");
    }

    let [box_details] = await box.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(box_id),
          user_id: new mongoose.Types.ObjectId(user_id),
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "box_types",
          localField: "box_size",
          foreignField: "_id",
          as: "box_type",
        },
      },
      {
        $unwind: {
          path: "$box_type",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "box_features",
          localField: "box_features",
          foreignField: "_id",
          as: "box_features",
        },
      },
      {
        $lookup: {
          from: "box_items",
          let: { box_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$box_id", "$$box_id"] },
                    { $eq: ["$user_id", new mongoose.Types.ObjectId(user_id)] },
                    { $eq: ["$is_deleted", false] },
                    { $eq: ["$is_bring", false] },
                    { $eq: ["$is_sale", false] },
                  ],
                },
              },
            },
            {
              $count: "avl_box_items",
            },
          ],
          as: "avl_box_items",
        },
      },
      {
        $addFields: {
          avl_box_items: {
            $ifNull: [{ $arrayElemAt: ["$avl_box_items.avl_box_items", 0] }, 0],
          },
        },
      },
      {
        $addFields: {
          box_image: {
            $cond: [
              { $ifNull: ["$box_image", false] },
              {
                $concat: [process.env.S3_BUCKET_URL, "$box_image"],
              },
              null,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          box_name: 1,
          box_size: "$box_type.box_type_name",
          total_item_capacity: "$box_type.capacity",
          avl_item_capacity: "$avl_box_items",
          // box_type: 1,
          box_features: {
            feature_name: 1,
          },
          exipiry_date: 1,
          subscription: 1,
          box_price: 1,
          box_image: 1,
          createdAt: 1,
        },
      },
    ]);

    return successRes(res, "Box details get successfully", box_details);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const boxList = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let {
      search = "",
      sort,
      page = 1,
      limit = 10,
      box_size,
      subscription,
      features,
    } = req.body;

    let query = {
      user_id: user_id,
      is_deleted: false,
    };

    let filter_query = {};

    let sorting = { createdAt: -1 };

    if (sort) {
      if (sort == "latest") {
        sorting = { createdAt: -1 };
      } else if (sort == "price_low_to_high") {
        sorting = { box_price: 1 };
      } else if (sort == "price_high_to_low") {
        sorting = { box_price: -1 };
      } else if (sort == "expiry_date") {
        sorting = { exipiry_date: 1 };
      } else {
        sorting = { createdAt: -1 };
      }
    }

    if (box_size) {
      box_size = JSON.parse(box_size);
      filter_query = {
        ...filter_query,
        "box_type.box_type_name": { $in: box_size },
        is_deleted: false,
      };
    }

    if (subscription) {
      subscription = JSON.parse(subscription);
      const hasActiveSubscription = subscription.some(
        (subscription) => subscription == "Active"
      );
      const hasExpiredSubscription = subscription.some(
        (subscription) => subscription == "Expired"
      );

      if (hasActiveSubscription && hasExpiredSubscription) {
        filter_query = {
          ...filter_query,
          // exipiry_date: {
          //     $or: [
          //         { $gt: new Date() },
          //         { $lte: new Date() }
          //     ]
          // }
        };
      } else if (hasActiveSubscription) {
        filter_query = { ...filter_query, exipiry_date: { $gt: new Date() } };
      } else if (hasExpiredSubscription) {
        filter_query = { ...filter_query, exipiry_date: { $lte: new Date() } };
      }
    }

    if (features) {
      features = JSON.parse(features);
      filter_query = {
        ...filter_query,
        "box_features.feature_name": { $in: features },
        is_deleted: false,
      };
    }

    console.log({
      filter_query,
    });

    let total_box_count = await box.countDocuments({
      user_id: user_id,
      is_deleted: false,
    });

    let boxList = await box.aggregate([
      {
        $match: query,
      },
      {
        $match: search
          ? {
              is_deleted: false,
              box_name: { $regex: search, $options: "i" },
            }
          : {},
      },
      {
        $lookup: {
          from: "box_types",
          localField: "box_size",
          foreignField: "_id",
          as: "box_type",
        },
      },
      {
        $unwind: {
          path: "$box_type",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "box_features",
          localField: "box_features",
          foreignField: "_id",
          as: "box_features",
        },
      },
      {
        $match: filter_query ? filter_query : {},
      },
      {
        $lookup: {
          from: "box_items",
          let: { box_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$box_id", "$$box_id"] },
                    { $eq: ["$user_id", new mongoose.Types.ObjectId(user_id)] },
                    { $eq: ["$is_deleted", false] },
                    { $eq: ["$is_bring", false] },
                    { $eq: ["$is_sale", false] },
                  ],
                },
              },
            },
            {
              $count: "avl_box_items",
            },
          ],
          as: "avl_box_items",
        },
      },
      {
        $addFields: {
          avl_box_items: {
            $ifNull: [{ $arrayElemAt: ["$avl_box_items.avl_box_items", 0] }, 0],
          },
        },
      },

      // {
      //     $match: box_size && box_size.length > 0
      //         ? { "box_type.box_type_name": { $in: box_size }, is_deleted: false }
      //         : {}
      // },
      // // Subscription filter
      // {
      //     $match: subscription && subscription.length > 0
      //         ? { subscription: { $in: subscription }, is_deleted: false }
      //         : {}
      // },
      // // Features filter
      // {
      //     $match: features && features.length > 0
      //         ? { "box_features.feature_name": { $in: features }, is_deleted: false }
      //         : {}
      // },
      {
        $addFields: {
          box_image: {
            $cond: [
              { $ifNull: ["$box_image", false] },
              {
                $concat: [process.env.S3_BUCKET_URL, "$box_image"],
              },
              null,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          box_name: 1,
          box_size: "$box_type.box_type_name",
          total_item_capacity: "$box_type.capacity",
          avl_item_capacity: "$avl_box_items",
          // box_type: 1,
          box_features: {
            feature_name: 1,
          },
          exipiry_date: 1,
          subscription: 1,
          box_price: 1,
          box_image: 1,
          createdAt: 1,
        },
      },
      { $sort: sorting },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ]);

    let box_list_data = {
      total_box_count: total_box_count,
      box_list: boxList,
    };

    return successRes(res, "Your Box list get successfully", box_list_data);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const deleteBox = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let find_user = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "User not found");
    }

    let { box_id } = req.body;

    let find_box = await box.findOne({
      _id: box_id,
      user_id: user_id,
      is_deleted: false,
    });

    if (!find_box) {
      return errorRes(res, "Box not found");
    }

    let box_items = await box_items.find({
      box_id: box_id,
      user_id: user_id,
      is_deleted: false,
    });

    await box_items.updateMany(
      {
        box_id: box_id,
        user_id: user_id,
      },
      {
        $set: {
          is_deleted: true,
        },
      }
    );

    await box.findByIdAndUpdate(
      { _id: box_id },
      {
        $set: {
          is_deleted: true,
        },
      }
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const addItem = async (req, res) => {
  try {
    let { box_id, item_name, descrption, pickup_address_id } = req.body;

    let user_id;
    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }
    console.log("user_id", user_id);

    let { item_image } = req.files;

    if (!item_image) {
      // return errorRes(res, "Please upload Item image");
      item_image = null;
    }

    let find_user = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "User not found");
    }

    let [find_box] = await box.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(box_id),
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "box_types",
          localField: "box_size",
          foreignField: "_id",
          as: "box_sizes",
        },
      },
      {
        $unwind: "$box_sizes",
      },
      {
        $project: {
          _id: 1, // Include the _id field
          user_id: 1,
          box_price: 1,
          subscription: 1,
          box_image: 1,
          avl_item_capacity: 1,
          exipiry_date: 1,
          box_type: "$box_sizes.size_name",
          amount: "$box_sizes.amount",
          capacity: "$box_sizes.capacity",
        },
      },
    ]);

    if (!find_box) {
      return errorRes(res, "Box is not found please verify it");
    }

    let find_address = await user_address.findOne({
      _id: pickup_address_id,
      user_id: user_id,
      is_deleted: false,
    });

    if (!find_address) {
      return errorRes(res, "Couldn't found address from your address list");
    }

    let find_item = await box_items.countDocuments({
      box_id: box_id,
      is_bring: false,
      is_deleted: false,
      is_active: false,
      is_sale: false,
    });

    if (find_item < find_box?.capacity) {
      let new_item = {
        box_id: box_id,
        user_id: user_id,
        item_name: item_name,
        description: descrption,
        item_image: item_image,
        pickup_address_id: pickup_address_id,
      };

      if (req.files) {
        if (item_image) {
          let file_extension = item_image.originalFilename
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
          let oldPath = item_image.path;
          let newPath = "item_images/" + file_name;

          let oldFile = null;

          const fileContent = fs.readFileSync(oldPath);

          let imageData = {
            newPath: newPath,
            fileContent: fileContent,
            profile_picture_type: item_image.type,
          };

          const uploadProfilePicture = await uploadFile(imageData);

          let itemImage = null;

          if (uploadProfilePicture.success) {
            itemImage = newPath;
          }

          new_item = {
            ...new_item,
            item_image: itemImage,
          };
        }
      }

      let create_item = await box_items.create(new_item);

      return successRes(res, "Item add successfully", create_item);
    } else {
      return errorRes(res, "You couldn't add item beacuse box is full");
    }
  } catch {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const editItem = async (req, res) => {
  try {
    let user_id;
    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }
    let { item_id, box_id, item_name, descrption, pickup_address_id } =
      req.body;

    let { item_image } = req.files;

    if (!item_image) {
      // return errorRes(res, "Please upload Item image");
      item_image = null;
    }

    let find_user = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "User not found");
    }

    let find_item = await box_items.findOne({
      _id: item_id,
      is_deleted: false,
    });

    if (!find_item) {
      return errorRes(res, "Couldn't found item");
    }

    let find_address = await user_address.findOne({
      _id: pickup_address_id,
      user_id: user_id,
      is_deleted: false,
    });

    if (!find_address) {
      return errorRes(res, "Couldn't found address from your address list");
    }

    console.log("find_item", find_item);

    if (box_id == undefined) {
      let update_item = await box_items.findByIdAndUpdate(
        { _id: item_id, is_deleted: false },
        {
          $set: {
            item_name: item_name,
            description: descrption,
            item_image: item_image,
          },
        }
      );

      return successRes(res, "Item update successfully", update_item);
    } else {
      let [find_box] = await box.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(box_id),
            is_deleted: false,
          },
        },
        {
          $lookup: {
            from: "box_types",
            localField: "box_size",
            foreignField: "_id",
            as: "box_sizes",
          },
        },
        {
          $unwind: "$box_sizes",
        },
        {
          $project: {
            _id: 1, // Include the _id field
            user_id: 1,
            box_price: 1,
            subscription: 1,
            box_image: 1,
            avl_item_capacity: 1,
            exipiry_date: 1,
            box_type: "$box_sizes.size_name",
            amount: "$box_sizes.amount",
            capacity: "$box_sizes.capacity",
          },
        },
      ]);

      if (!find_box) {
        return errorRes(res, "Selectted box is not found please verify it");
      }

      let find_item_count = await box_items.countDocuments({
        box_id: box_id,
        is_bring: false,
        is_deleted: false,
      });

      if (find_item_count < find_box?.capacity) {
        let update_item_data = {
          item_name: item_name,
          description: descrption,
          item_image: item_image,
          box_id: box_id,
        };

        if (req.files) {
          if (item_image) {
            let file_extension = item_image.originalFilename
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
            let oldPath = item_image.path;
            let newPath = "item_images/" + file_name;

            let oldFile = null;

            if (find_item.item_image != null) {
              let deletedFileData = {
                filePath: find_item.item_image,
              };

              await deleteFile(deletedFileData);
            }

            const fileContent = fs.readFileSync(oldPath);

            let imageData = {
              newPath: newPath,
              fileContent: fileContent,
              profile_picture_type: item_image.type,
            };

            const uploadProfilePicture = await uploadFile(imageData);

            let itemImage = null;

            if (uploadProfilePicture.success) {
              itemImage = newPath;
            }

            update_item_data = {
              ...update_item_data,
              item_image: itemImage,
            };
          } else {
            update_item_data = {
              ...update_item_data,
              item_image: find_item.item_image,
            };
          }
        }

        let update_item = await box_items.findByIdAndUpdate(
          { _id: item_id, is_deleted: false },
          {
            $set: update_item_data,
          }
        );

        return successRes(res, "Item update successfully", update_item);
      } else {
        return errorRes(res, "You couldn't add item beacuse box is full");
      }
    }

    //manage history if we neeed store history for fromwhich box to another box item is gone
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const deleteItem = async (req, res) => {
  try {
    let user_id;
    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { item_id, box_id } = req.body;

    let find_user = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "User not found");
    }

    let find_item = await box_items.findOne({
      _id: item_id,
      is_deleted: false,
    });

    if (!find_item) {
      return errorRes(res, "Couldn't found item");
    }

    let find_box = await box.findOne({
      _id: box_id,
      user_id: user_id,
      is_deleted: false,
    });

    if (!find_box) {
      return errorRes(res, "Box is not found please verify it");
    }

    let delete_item = await box_items.findByIdAndUpdate(
      { _id: item_id, is_deleted: false },
      {
        $set: {
          is_deleted: true,
        },
      }
    );

    return successRes(res, "Your item has been deleted successfully", []);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const itemDetails = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { item_id } = req.body;

    let find_user = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "User not found");
    }

    let userObjectId = new mongoose.Types.ObjectId(user_id);
    let itemObjectId = new mongoose.Types.ObjectId(item_id);

    let [item_details] = await box_items.aggregate([
      {
        $match: {
          _id: itemObjectId,
          user_id: userObjectId,
          is_deleted: false,
        },
      },
      {
        $addFields: {
          item_image: {
            $cond: [
              { $ifNull: ["$item_image", false] },
              {
                $concat: [process.env.S3_BUCKET_URL, "$item_image"],
              },
              null,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          box_id: 1,
          item_name: 1,
          descrption: 1,
          item_image: 1,
          is_sale: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return successRes(res, "Your item details get successfully", item_details);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const boxItemList = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { box_id, search = "", page = 1, limit = 10 } = req.body;

    let find_user = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "User not found");
    }

    let find_box = await box.findOne({
      _id: box_id,
      user_id: user_id,
      is_deleted: false,
    });

    if (!find_box) {
      return errorRes(res, "Box not found");
    }

    let total_box_items_count = await box_items.countDocuments({
      user_id: user_id,
      box_id: box_id,
      is_deleted: false,
      is_bring: false,
      is_sale: false,
    });

    let userObjectId = new mongoose.Types.ObjectId(user_id);
    let boxObjectId = new mongoose.Types.ObjectId(box_id);

    let box_items_list = await box_items.aggregate([
      {
        $match: {
          user_id: userObjectId,
          box_id: boxObjectId,
          is_deleted: false,
          is_bring: false,
          is_sale: false,
        },
      },
      {
        $match: search
          ? {
              is_deleted: false,
              item_name: { $regex: search, $options: "i" },
            }
          : {},
      },
      {
        $addFields: {
          item_image: {
            $cond: [
              { $ifNull: ["$item_image", false] },
              {
                $concat: [process.env.S3_BUCKET_URL, "$item_image"],
              },
              null,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          box_id: 1,
          item_name: 1,
          descrption: 1,
          item_image: 1,
          is_sale: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ]);

    let box_items_data = {
      box_name: find_box.box_name,
      total_box_items_count: total_box_items_count,
      box_items_list: box_items_list,
    };

    return successRes(
      res,
      "Your Box items list get successfully",
      box_items_data
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const allItemsLists = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { search = "", page = 1, limit = 10, sort } = req.body;

    let userObjectId = new mongoose.Types.ObjectId(user_id);

    let query = {
      user_id: userObjectId,
      is_deleted: false,
      is_bring: false,
    };

    let sorting = { createdAt: -1 };

    if (sort) {
      if (sort == "newest_first") {
        sorting = { createdAt: -1 };
      } else if (sort == "oldest_first") {
        sorting = { createdAt: 1 };
      } else if (sort == "item_on_sale") {
        query = {
          ...query,
          is_sale: true,
        };
      } else {
        sorting = { createdAt: -1 };
      }
    }

    let find_user = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "User not found");
    }

    let total_items_count = await box_items.countDocuments({
      user_id: user_id,
      is_deleted: false,
      is_bring: false,
    });

    console.log({ query });

    let items_list = await box_items.aggregate([
      {
        $match: query,
      },
      {
        $match: search
          ? {
              is_deleted: false,
              item_name: { $regex: search, $options: "i" },
            }
          : {},
      },
      {
        $addFields: {
          item_image: {
            $cond: [
              { $ifNull: ["$item_image", false] },
              {
                $concat: [process.env.S3_BUCKET_URL, "$item_image"],
              },
              null,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          box_id: 1,
          item_name: 1,
          descrption: 1,
          item_image: 1,
          is_sale: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: sorting,
      },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ]);

    let box_items_data = {
      total_items_count: total_items_count,
      items_list: items_list,
    };

    return successRes(
      res,
      "Your all items list get successfully",
      box_items_data
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const allSale_ItemsList = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { page = 1, limit = 10 } = req.body;

    let userObjectId = new mongoose.Types.ObjectId(user_id);

    let query = {
      user_id: userObjectId,
      is_deleted: false,
      is_bring: false,
      is_sale: true,
    };

    let find_user = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "User not found");
    }

    let total_items_count = await box_items.countDocuments({
      user_id: user_id,
      is_deleted: false,
      is_bring: false,
      is_sale: true,
    });

    let items_list = await box_items.aggregate([
      {
        $match: query,
      },
      {
        $addFields: {
          item_image: {
            $cond: [
              { $ifNull: ["$item_image", false] },
              {
                $concat: [process.env.S3_BUCKET_URL, "$item_image"],
              },
              null,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          box_id: 1,
          item_name: 1,
          descrption: 1,
          item_image: 1,
          is_sale: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ]);

    let items_data = {
      total_items_count: total_items_count,
      items_list: items_list,
    };

    return successRes(res, "Your Sale items list get successfully", items_data);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

module.exports = {
  buyBox,
  editBox,
  boxDetails,
  boxList,
  deleteBox,
  addItem,
  editItem,
  deleteItem,
  itemDetails,
  boxItemList,
  allItemsLists,
  allSale_ItemsList,
};
