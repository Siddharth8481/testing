const mongoose = require("mongoose");

const user_addressSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        address_name: {
            type: String,
            // required: [true, "Address name is required."],
        },
        contact_number: {
            type: Number,
            default: null,
        },
        country_code: {
            type: String,
            default: null,
        },
        address: {
            type: String,
        },
        is_primary: {
            type: Boolean,
            enum: [true, false],
            default: false, // true-selected, false-Not_selected
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false, // true-deleted, false-Not_deleted
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("address", user_addressSchema);
