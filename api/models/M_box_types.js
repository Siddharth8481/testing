const mongoose = require("mongoose");

const box_typeSchema = new mongoose.Schema(
    {
        box_type_name:{
            type: String,
        },
        amount:{
            type: Number,
        },
        capacity:{
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

module.exports = mongoose.model("box_type", box_typeSchema);
