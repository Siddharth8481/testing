const chat_room = require("../../api/models/M_chat_room");
const users = require("../../api/models/M_user");
const user_session = require("../../api/models/M_user_session");
const chat = require("../../api/models/M_chat");

const { dateTime } = require("../../utils/date_time");
module.exports = {
  createRoom: async (data) => {
    try {
      let { user_id, other_user_id, public_item_id } = data;

      let room_code = Math.floor(100000 + Math.random() * 900000);

      let cond1 = {
        user_id: user_id,
        other_user_id: other_user_id,
        public_item_id: public_item_id,
      };

      let cond2 = {
        user_id: other_user_id,
        other_user_id: user_id,
        public_item_id: public_item_id,
      };

      let createdata = {
        user_id: other_user_id,
        other_user_id: user_id,
        room_code: room_code,
        public_item_id: public_item_id,
      };

      // createData = { ...createData, item_id: item_id };

      let findFirstroom = await chat_room
        .findOne(cond1)
        .populate({
          path: "public_item_id",
          populate: {
            path: "item_id",
          },
        })
        .populate({
          path: "user_id",
          select:
            "user_name user_profile_url profile_picture is_online device_type device_token",
        })
        .populate({
          path: "other_user_id",
          select:
            "user_name user_profile_url profile_picture is_online device_type device_token",
        });

      let findSecondroom = await chat_room
        .findOne(cond2)
        .populate({
          path: "public_item_id",
          populate: {
            path: "item_id",
          },
        })
        .populate({
          path: "user_id",
          select:
            "user_name user_profile_url profile_picture is_online device_type device_token",
        })
        .populate({
          path: "other_user_id",
          select:
            "user_name user_profile_url profile_picture is_online device_type device_token",
        });

      let findRoom = findFirstroom ? findFirstroom : findSecondroom;
      if (findRoom) {
        // return findRoom;

        return {
          status: true,
          message: "Your room created successfully",
          data: findRoom,
        };
      } else {
        let createroom = await chat_room.create(createdata);
        // return createroom;

        return {
          message: "Your room created successfully",
          status: true,
          data: createroom,
        };
      }
    } catch (error) {
      return {
        status: false,
        message: "interal server error:" + error.message,
      };
      throw new Error(error.message);
    }
  },
  
  chatUserList: async (data) => {
    console.log(data);
    var { user_id } = data;

    var match_condition = {
      $or: [{ user_id: user_id }, { other_user_id: user_id }],
      is_deleted: false,
    };

    // var findRoom = await chat_room
    //   .find(match_condition)
    //   .select("user_id other_user_id room_code is_deleted");

    var findRoom = await chat_room
      .find(match_condition)
      .select("user_id other_user_id room_code is_deleted")
      .populate({
        path: "public_item_id",
        populate: {
          path: "item_id",
        },
      })
      .populate({
        path: "user_id",
        select:
          "user_name user_profile_url profile_picture is_online device_type device_token",
      })
      .populate({
        path: "other_user_id",
        select:
          "user_name user_profile_url profile_picture is_online device_type device_token",
      });

    var UserList = await Promise.all(
      findRoom.map(async (value) => {
        var result = { ...value._doc };

        let findLastMsg = await chat
          .findOne()
          .where({
            chat_room_id: value._id,
            is_delete_by: { $ne: user_id },
          })
          .sort({ createdAt: -1 });

        let unreadMessage = await chat.countDocuments({
          chat_room_id: value._id,
          is_delete_by: { $ne: user_id },
          receiver_id: user_id,
          is_read: false,
        });

        console.log("test", unreadMessage);

        if (findLastMsg) {
          if (findLastMsg.message_type == "text") {
            var last_message = findLastMsg.message;
          }
          var last_message_time = findLastMsg.message_time;
        } else {
          var last_message = null;
          var last_message_time = null;
        }

        if (value.user_id == user_id) {
          var other_user = value.other_user_id;
        } else {
          var other_user = value.user_id;
        }

        let findOtherUser = await users
          .findById(other_user)
          .select("user_id user_name profile_picture");

        if (findOtherUser) {
          result = {
            ...result,
            user_name: findOtherUser.user_name,
            profile_picture: findOtherUser.profile_picture,
          };
        }

        result = {
          ...result,
          last_message,
          last_message_time,
          unread_message: unreadMessage,
        };

        return result;
      })
    );

    await UserList.sort(function (a, b) {
      return new Date(b.last_message_time) - new Date(a.last_message_time);
    });

    return UserList;
  },

  sendMessage: async (data) => {
    let { chat_room_id, sender_id, receiver_id, message, message_type } = data;

    let currentDateTime = new Date();

    let insertData = {
      chat_room_id: chat_room_id,
      sender_id: sender_id,
      receiver_id: receiver_id,
      message_time: currentDateTime,
      message: message,
      message_type: message_type,
      created_at: currentDateTime,
      updated_at: currentDateTime,
    };

    let sender_socket_id = await users.findById(sender_id);
    var check_room_data = await chat_room.findById(chat_room_id);

    let receiver_socket_id = await users.findById(receiver_id);

    if (
      check_room_data?.screen_user_status == true &&
      check_room_data?.screen_otheruser_status == true
    ) {
      insertData = {
        ...insertData,
        is_read: true,
      };
    } else {
      insertData = {
        ...insertData,
        is_read: false,
      };
    }

    let addMessage = await chat.create(insertData);

    let getMessage = await chat
      .findById(addMessage._id)
      .populate({
        path: "sender_id",
        model: "users",
        select: "full_name is_online is_verified profile_url profile_picture",
      })
      .populate({
        path: "receiver_id",
        model: "users",
        select: "full_name is_online is_verified profile_url profile_picture",
      });

    let get_receiver_user = await users.findById(receiver_id).where({
      is_deleted: false,
    });

    let get_sender_user = await users.findById(sender_id);

    // if (get_receiver_user) {
    //   let name = "";
    //   var img = "";
    //   if (get_sender_user != null) {
    //     name = get_sender_user.full_name;
    //     if (get_sender_user.profile_picture) {
    //       img = process.env.BASE_URL + get_sender_user.profile_picture;
    //     } else {
    //       img = get_sender_user.profile_url;
    //     }
    //   }
    //   var messageTemp;
    //   if (message) {
    //     messageTemp = message;
    //   } else {
    //     messageTemp = "media";
    //   }
    //   var chat_room_data = await chat_room
    //     .find()
    //     .where({
    //       _id: data.chat_room_id,
    //       is_deleted: false,
    //     })
    //     .populate({
    //       path: "user_id",
    //       model: "users",
    //       select: "full_name is_online is_verified profile_url profile_picture",
    //     })
    //     .populate({
    //       path: "other_user_id",
    //       model: "users",
    //       select: "full_name is_online is_verified profile_url profile_picture",
    //     });

    //   if (
    //     chat_room_data[0]?.user_id?.profile_picture &&
    //     !chat_room_data[0]?.user_id?.profile_picture.startsWith(
    //       process.env.BASE_URL
    //     )
    //   ) {
    //     chat_room_data[0].user_id.profile_picture =
    //       process.env.BASE_URL + chat_room_data[0].user_id.profile_picture;
    //   }

    //   if (
    //     chat_room_data[0]?.other_user_id?.profile_picture &&
    //     !chat_room_data[0]?.other_user_id?.profile_picture.startsWith(
    //       process.env.BASE_URL
    //     )
    //   ) {
    //     chat_room_data[0].other_user_id.profile_picture =
    //       process.env.BASE_URL +
    //       chat_room_data[0].other_user_id.profile_picture;
    //   }

    //   let notiData = {
    //     noti_msg: messageTemp,
    //     noti_title: name,
    //     noti_type: "chat_noti",
    //     noti_for: "chat_noti",
    //     id: sender_id,
    //     chat_room_id: chat_room_id,
    //     details: chat_room_data[0],
    //   };

    //   if (get_receiver_user) {
    //     if (
    //       get_receiver_user.device_token != "" ||
    //       get_receiver_user.device_token != null
    //     ) {
    //       var find_token = await user_session.find({
    //         user_id: get_receiver_user?._id,
    //         is_deleted: false,
    //         logout_time: null,
    //       });

    //       var device_token_array = [];
    //       for (var value of find_token) {
    //         var device_token = value.device_token;
    //         device_token_array.push(device_token);
    //       }
    //       notiData = { ...notiData, device_token: device_token_array };

    //       if (device_token_array.length > 0) {
    //         if (
    //           get_receiver_user?._id.equals(chat_room_data[0]?.user_id?._id)
    //         ) {
    //           if (chat_room_data[0].screen_user_status == false) {
    //             await notiSendMultipleDevice(notiData);
    //           }
    //         }
    //       }
    //       if (device_token_array.length > 0) {
    //         if (
    //           get_receiver_user?._id.equals(
    //             chat_room_data[0]?.other_user_id?._id
    //           )
    //         ) {
    //           if (chat_room_data[0].screen_otheruser_status == false) {
    //             await notiSendMultipleDevice(notiData);
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    return getMessage;
  },

  setSocketId: async (data) => {
    try {
      let { user_id, device_token, socket_data } = data;
      const user = await users.findOne({
        _id: user_id,
        is_deleted: false,
      });

      if (user) {
        var updatesocketId = await user_session.findOneAndUpdate(
          { user_id: user_id, device_token: device_token },
          {
            $set: {
              socket_id: socket_data,
            },
          },
          { new: true }
        );

        return updatesocketId;
      }
    } catch (error) {
      console.log("error", error.message);
      throw new Error(error.message);
    }
  },

  screenUserCheck: async (data) => {
    try {
      let { user_id, chat_room_id, screen_status } = data;
      let find_chat_room = await chat_room.findOne({
        _id: chat_room_id,
      });

      var store_user_id = find_chat_room.user_id;
      var store_other_userid = find_chat_room.other_user_id;

      var final_result;

      if (store_user_id.equals(user_id)) {
        let updateStatus = {
          screen_user_status: screen_status,
          updated_At: new Date(),
        };
        var updateData = await chat_room.findByIdAndUpdate(
          chat_room_id,
          updateStatus,
          {
            new: true,
          }
        );

        // var find_unread_message = await chat.find({
        //   chat_room_id: chat_room_id,
        //   receiver_id: user_id,
        //   is_read: false,
        // });

        // final_result = {
        //   ...final_result,
        //   find_unread_message,
        // };
        var chatUpdate = await chat.updateMany(
          {
            chat_room_id: chat_room_id,
            receiver_id: user_id,
            is_read: false,
          },
          { $set: { is_read: true } },
          { new: true }
        );

        return updateData;
      }
      if (store_other_userid.equals(user_id)) {
        let updateStatus = {
          screen_otheruser_status: screen_status,
          updated_At: new Date(),
        };
        var updateData = await chat_room.findByIdAndUpdate(
          chat_room_id,
          updateStatus,
          {
            new: true,
          }
        );

        // var find_unread_message = await chat.find({
        //   chat_room_id: chat_room_id,
        //   receiver_id: user_id,
        //   is_read: false,
        // });
        // final_result = {
        //   ...final_result,
        //   find_unread_message,
        // };

        var chatUpdate = await chat.updateMany(
          {
            chat_room_id: chat_room_id,
            receiver_id: user_id,
            is_read: false,
          },
          { $set: { is_read: true } },
          { new: true }
        );

        return updateData;
      }
    } catch (error) {
      console.log("error", error.message);
      throw new Error(error.message);
    }
  },

  getAllMessage: async (data) => {
    let { chat_room_id, user_id, page = 1, skip = 0, limit = 20 } = data;

    let findAllMessage = await chat
      .find({ chat_room_id: chat_room_id })
      .where({ is_delete_by: { $ne: user_id } })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate({
        path: "sender_id",
        model: "users",
        select: "unique_name full_name profile_url profile_picture is_online ",
      })
      .populate({
        path: "receiver_id",
        model: "users",
        select: "unique_name full_name profile_url profile_picture is_online",
      });

    await chat.updateMany(
      { chat_room_id: chat_room_id, receiver_id: user_id },
      { $set: { is_read: true } }
    );

    return findAllMessage;
  },

  unreadMessage: async (data) => {
    let { chat_room_id, user_id } = data;

    let chatUpdate = await chat.updateMany(
      { chat_room_id: chat_room_id, receiver_id: user_id, is_read: false },
      { $set: { is_read: true } },
      { new: true }
    );

    let result = { is_read: true };

    return result;
  },

  disconnectSocket: async (data) => {
    try {
      var updatedMessage = await user_session.updateOne(
        { socket_id: data },
        {
          $set: {
            socket_id: null,
          },
        },
        { new: true }
      );
      return updatedMessage;
    } catch (error) {
      console.log("error", error.message);
      throw new Error(error.message);
    }
  },

  deleteOneChat: async (data) => {
    let { chat_id, user_id } = data;

    let deleteAllsChats = await chat.find({ _id: chat_id });
    if (deleteAllsChats) {
      var delete_data = { is_delete_by: user_id };

      await chat.updateOne({ _id: chat_id }, { $push: delete_data });

      let result = { id_deleted: true };

      return result;
    }
  },

  deleteChat: async (data) => {
    let { chat_room_id, user_id } = data;

    let deleteChatData = await chat.findOne({ chat_room_id: chat_room_id });
    if (deleteChatData) {
      var delete_data = { is_delete_by: user_id };

      await chat
        .updateMany({ chat_room_id: chat_room_id }, { $push: delete_data })
        .where({ is_delete_by: { $ne: user_id } });
    }
    let result = { id_deleted: true };

    return result;
  },

};
