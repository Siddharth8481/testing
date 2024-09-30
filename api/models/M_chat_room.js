const mongoose = require("mongoose");

const chat_roomSchema = new mongoose.Schema(
  {
    public_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "public_items",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    other_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    item_owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    screen_user_status: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    screen_otheruser_status: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    is_active: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("chat_room", chat_roomSchema);
