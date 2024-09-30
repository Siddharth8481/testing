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
const public_item = require("../../../models/M_public_items");

const {
  successRes,
  errorRes,
  multiSuccessRes,
} = require("../../../../utils/common_fun");

const addItemOnsale = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { item_id, title, description, price } = req.body;

    let find_user = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "User not found");
    }

    let find_item = await box_items.findOne({
      _id: item_id,
      user_id: user_id,
      is_deleted: false,
    });

    if (!find_item) {
      return errorRes(res, "Couldn't found item");
    }

    if (find_item.is_sale == true) {
      return errorRes(res, "This item already on sale");
    }

    let find_public_item = await public_item.findOne({
      item_id: item_id,
      is_deleted: false,
    });

    if (find_public_item) {
      return errorRes(res, "This item already in public");
    }

    let new_public_item = {
      item_id: item_id,
      title: title,
      description: description,
      price: price,
    };

    let created_public_item = await public_item.create(new_public_item);

    await box_items.findOneAndUpdate(
      {
        _id: item_id,
        is_deleted: false,
      },
      {
        $set: { is_sale: true },
      }
    );

    if (created_public_item) {
      return successRes(
        res,
        "Public item create successfully",
        created_public_item
      );
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const removeItemfromSale = async (req, res) => {
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

    let find_item = await box_items.findOne({
      _id: item_id,
      user_id: user_id,
      is_deleted: false,
    });

    if (!find_item) {
      return errorRes(res, "Couldn't found item");
    }

    if (find_item.is_sale == true) {
      return errorRes(res, "This item already on sale");
    }

    let find_public_item = await public_item.findOne({
      item_id: item_id,
      is_deleted: false,
    });

    if (find_public_item) {
      // return errorRes(res, "This item already in public");

      let find_public_item = await public_item.findOneAndUpdate(
        {
          item_id: item_id,
          is_deleted: false,
        },
        {
          $set: { is_deleted: true },
        }
      );

      await box_items.findOneAndUpdate(
        {
          _id: item_id,
          user_id: user_id,
          is_deleted: false,
        },
        {
          $set: { is_sale: false },
        }
      );

      return successRes(res, "Your item remove from Public successfully", []);
    } else {
      return errorRes(res, "This item is not in public");
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const getAllPublicItems = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { page = 1, limit = 10, sort, search = "" } = req.body;

    let sorting = { createdAt: -1 };

    if (sort) {
      if (sort == "newest") {
        sorting = { createdAt: -1 };
      } else if (sort == "oldest") {
        sorting = { createdAt: 1 };
      } else if (sort == "price_low_to_high") {
        sorting = { price: 1 };
      } else if (sort == "price_high_to_low") {
        sorting = { price: -1 };
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

    let public_items = await public_item.aggregate([
      {
        $match: {
          is_deleted: false,
        },
      },
      {
        $match: search
          ? {
              is_deleted: false,
              title: { $regex: search, $options: "i" },
            }
          : {},
      },
      {
        $lookup: {
          from: "box_items",
          localField: "item_id",
          foreignField: "_id",
          as: "box_items",
        },
      },
      {
        $unwind: {
          path: "$box_items",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          item_image: {
            $cond: [
              { $ifNull: ["$box_items.item_image", false] },
              {
                $concat: [process.env.S3_BUCKET_URL, "$box_items.item_image"],
              },
              null,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          item_id: 1,
          item_image: 1,
          title: 1,
          description: 1,
          price: 1,
          createdAt: 1,
        },
      },
      { $sort: sorting },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ]);

    return successRes(res, "Public items get successfully", public_items);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const getPublicItemDetails = async (req, res) => {
  try {
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { public_item_id } = req.body;

    let find_user = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "User not found");
    }

    let [public_item_detail] = await public_item.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(public_item_id),
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "box_items",
          localField: "item_id",
          foreignField: "_id",
          as: "item_details",
        },
      },
      {
        $unwind: {
          path: "$item_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "item_details.user_id",
          foreignField: "_id",
          as: "seller_details",
        },
      },
      {
        $unwind: {
          path: "$seller_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          item_image: {
            $cond: [
              { $ifNull: ["$item_details.item_image", false] },
              {
                $concat: [
                  process.env.S3_BUCKET_URL,
                  "$item_details.item_image",
                ],
              },
              null,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          item_id: 1,
          item_image: 1,
          title: 1,
          description: 1,
          price: 1,
          seller_details: 1,
        },
      },
    ]);

    return successRes(
      res,
      "Public item details get successfully",
      public_item_detail
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const moveToBox = async (req, res) => {
  try {
    //add status of sale in item and public
    let user_id;

    if (!req.body.user_id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    let { item_id, box_id, deliver_address_id, is_address, price } = req.body;

    let find_user = await users.findOne({
      _id: user_id,
      is_deleted: false,
    });

    if (!find_user) {
      return errorRes(res, "User not found");
    }

    if (find_user?.credit < price) {
      return errorRes(res, "You have to add some credit");
    }

    let find_item = await box_items.findOne({
      _id: item_id,
      is_deleted: false,
    });

    if (!find_item) {
      return errorRes(res, "Couldn't found item");
    }

    let find_public_item = await public_item.findOne({
      item_id: item_id,
      is_deleted: false,
      is_item_sold: false,
      is_active: true,
    });

    if (!find_public_item) {
      return errorRes(res, "This item is not in public");
    }

    if (is_address == true) {
      let find_pickup_address = await addresses.findOne({
        _id: find_item?.pickup_address_id.toString(),
        user_id: find_item?.user_id.toString(),
        is_deleted: false,
      });

      if (!find_pickup_address) {
        return errorRes(res, "Couldn't found pickup address");
      }

      let find_address = await addresses.findOne({
        _id: deliver_address_id,
        user_id: user_id,
        is_deleted: false,
      });

      if (!find_address) {
        return errorRes(res, "Couldn't found delivery address");
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



      

      let find_item_count = await box_items.countDocuments({
        box_id: box_id,
        is_bring: false,
        is_deleted: false,
        is_active: false,
        is_sale: false,
      });

      if (find_item_count < find_box?.capacity) {
        let new_item = {
          box_id: box_id,
          user_id: user_id,
          item_id: item_id,
          item_name: find_public_item?.title,
          description: find_public_item?.description,
          item_image: find_item?.item_image,
          pickup_address_id: find_item?.pickup_address_id.toString(),
          deliver_address_id: deliver_address_id,
        };

        let create_item = await box_items.create(new_item);

        let update_item = await box_items.updateOne(
          {
            _id: item_id,
            is_deleted: false,
            is_active: true,
          },
          {
            $set: { is_active: false },
          }
        );

        let update_public_item = await public_item.updateOne(
          {
            item_id: item_id,
            is_deleted: false,
            is_item_sold: false,
            is_active: true,
          },
          {
            $set: { is_item_sold: true, is_active: false },
          }
        );

        await users.findByIdAndUpdate(
          { _id: find_item.user_id.toString() },
          {
            $inc: {
              credit: +parseInt(price),
            },
          }
        );

        await users.findByIdAndUpdate(
          { _id: user_id },
          {
            $inc: {
              credit: -parseInt(price),
            },
          }
        );
      } else {
        return errorRes(res, "You couldn't add item beacuse box is full");
      }
      //in progress
    } else {
    }
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

module.exports = {
  addItemOnsale,
  removeItemfromSale,
  getAllPublicItems,
  getPublicItemDetails,
};
