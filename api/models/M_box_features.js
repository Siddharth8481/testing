const mongoose = require("mongoose");

const box_featuresSchema = new mongoose.Schema(
    {
        feature_name:{
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

module.exports = mongoose.model("box_features", box_featuresSchema);
