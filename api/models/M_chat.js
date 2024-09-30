const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    chat_room_id: {
      // chat room id  needed when it's individual messages
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat_room",
      required: false,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Sender id is required."],
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Receiver id is required."],
    },
    message_time: {
      type: String,
      required: [true, "Message time is required."],
    },
    message: {
      type: String,
    },
    message_type: {
      type: String,
      enum: ["text", "media", "emoji"],
      required: [true, "Message type is required."],
    },
    is_read: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-read, false-unread
    },
    is_delete_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("chat", chatSchema);
