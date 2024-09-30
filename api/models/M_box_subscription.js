const mongoose = require("mongoose");

const box_subscriptionSchema = new mongoose.Schema(
    {
        subscription_name:{
            type: String,
        },
        amount:{
            type: Number,
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false, // true-deleted, false-Not_deleted
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("box_subscription", box_subscriptionSchema);
