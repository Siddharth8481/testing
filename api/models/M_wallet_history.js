const mongoose = require("mongoose");

const wallet_history_Schema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        amount:{
            type: Number,
            required: true,
        },
        transaction_type: {
            type: String,
            enum: ["credit", "debit"],
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false, // true-deleted, false-Not_deleted
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("wallet_history", wallet_history_Schema);
