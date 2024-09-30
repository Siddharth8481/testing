const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const user = require("../../../models/M_user");
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

const add_box_types = async (req, res) => {
  try {
    let { box_type_name, amount, capacity } = req.body;

    let box_type_data = {
      box_type_name,
      amount,
      capacity,
    };

    let add_box_type = await box_types.create(box_type_data);

    return successRes(res, "Box type added successfully", add_box_type);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const add_box_subscription = async (req, res) => {
  try {
    let { subscription_name, amount } = req.body;

    let box_subscription_data = {
      subscription_name,
      amount,
    };

    let add_box_subscription = await box_subscription.create(
      box_subscription_data
    );

    return successRes(
      res,
      "Box subscription added successfully",
      add_box_subscription
    );
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const add_box_features = async (req, res) => {
  try {
    let { feature_name, amount } = req.body;

    let box_features_data = {
      feature_name,
      amount,
    };

    let add_box_features = await box_features.create(box_features_data);

    return successRes(res, "Box features added successfully", add_box_features);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const box_type_list = async (req, res) => {
  try {
    let box_types_data = await box_types.find({
      is_deleted: false,
    });

    return successRes(res, "Box type list", box_types_data);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const subscription_list = async (req, res) => {
  try {
    let box_subscription_data = await box_subscription.find({
      is_deleted: false,
    });

    return successRes(res, "Subscription list", box_subscription_data);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

const feature_list = async (req, res) => {
  try {
    let box_features_data = await box_features.find({
      is_deleted: false,
    });

    return successRes(res, "Feature list", box_features_data);
  } catch (error) {
    console.log("Error : ", error);
    return errorRes(res, "Internal server error");
  }
};

module.exports = {
  add_box_types,
  add_box_subscription,
  add_box_features,
  box_type_list,
  subscription_list,
  feature_list,
};
