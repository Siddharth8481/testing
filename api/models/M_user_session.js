const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    user_type: {
      type: String,
      enum: ["user", "admin", "employee"],
      required: [true, "User type is required."],
    },
    device_token: {
      type: String,
      required: [true, "Device token is required."],
    },
    auth_token: {
      type: String,
      required: false,
    },
    device_type: {
      type: String,
      enum: ["ios", "android", "web"],
      required: [true, "Device type is required."],
    },
    socket_id: {
      type: String, //store socket ID,
      default: null,
    },
    is_login: {
      type: Boolean,
      required: true,
      default: true,
    },
    is_active: {
      type: Boolean,
      required: true,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("user_session", userSessionSchema);
