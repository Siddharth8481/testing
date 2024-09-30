const mongoose = require("mongoose");

const public_itemSchema = new mongoose.Schema(
  {
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "box_items",
      required: true,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    is_item_sold: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    is_item_remove: {
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

module.exports = mongoose.model("public_items", public_itemSchema);
