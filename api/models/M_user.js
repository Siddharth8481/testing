const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema(
  {
    user_type: {
      type: String,
      enum: ["user", "admin", "employee"],
      default: "user",
      required: [true, "User type is required."],
    },
    full_name: {
      type: String,
    },
    email_address: {
      type: String,
    },
    password: {
      type: String,
    },
    profile_picture: {
      type: String,
      default: null,
    },
    noti_badge: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    is_self_delete: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted_account, false-active account
    },
    is_active: {
      type: Boolean,
      enum: [true, false],
      default: true, //
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("users", usersSchema);
