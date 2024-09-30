const mongoose = require("mongoose");

const box_itemSchema = new mongoose.Schema(
  {
    box_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "boxes",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    item_id: {
      //for reference
      type: mongoose.Schema.Types.ObjectId,
      ref: "box_items",
      default: null,
    },
    item_name: {
      type: String,
      required: true,
    },
    descrption: {
      type: String,
    },
    item_image: {
      type: String,
      default: null,
    },
    pickup_address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_address",
      default: null,
    },
    deliver_address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_address",
      default: null,
    },
    is_bring: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    is_sale: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    is_active: {
      type: Boolean,
      enum: [true, false],
      default: true,
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("box_items", box_itemSchema);
