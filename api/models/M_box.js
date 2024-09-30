const mongoose = require("mongoose");

const boxSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    box_name: {
      type: String,
      required: true,
    },
    box_size: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "box_types",
    },
    box_price: {
      type: Number,
    },
    box_features: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "box_features",
      },
    ],
    subscription: {
      type: String,
      enum: ["weekly", "monthly", "yearly"],
    },
    box_image: {
      type: String,
      default: null,
    },
    total_item_capacity: {
      type: Number,
      // default: 0,
    },
    avl_item_capacity: {
      type: Number,
      default: 0,
    },
    exipiry_date: {
      type: Date,
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

module.exports = mongoose.model("box", boxSchema);
