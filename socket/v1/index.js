const {
  createRoom,
  chatUserList,
  sendMessage,
  setSocketId,
  getAllMessage,
  unreadMessage,
  disconnectSocket,
  deleteOneChat,
  deleteChat,
} = require("./chat");
const mongoose = require("mongoose");
const user_session = require("../../api/models/M_user_session");
module.exports = function (io) {
  var v1version = io.of("/v1");
  v1version.on("connection", (socket) => {
    console.log("Socket connected  v1.....", socket.id);

    socket.on("disconnect", async (data) => {
      try {
        console.log("Socket disconnected  v1.....", socket.id);
        let socket_id = socket.id;
        const find_session = await user_session.findOne({
          socket_id: socket_id,
        });

        if (find_session) {
          let user_id = find_session?.user_id.toString();

          var match_condition = {
            $or: [{ user_id: user_id }, { other_user_id: user_id }],
            is_deleted: false,
          };

          var findRoom = await chat_room
            .find(match_condition)
            .populate("user_id")
            .populate("other_user_id");

          findRoom?.map(async (data) => {
            if (user_id.equals(data?.other_user_id?._id)) {
              var update = await chat_room.findByIdAndUpdate(
                {
                  _id: data._id,
                },
                {
                  $set: {
                    screen_otheruser_status: false,
                  },
                },

                { new: true }
              );
            }

            if (user_id.equals(data?.user_id?._id)) {
              var update = await chat_room.findByIdAndUpdate(
                {
                  _id: data._id,
                },
                {
                  $set: {
                    screen_user_status: false,
                  },
                },

                { new: true }
              );
            }
          });

          let socketcheckData = await disconnectSocket(socket_id);
        }
      } catch (error) {
        console.log("=== createRoom ===", error);
      }
    });

    socket.on("createRoom", async (data) => {
      try {
        console.log(" -----------  v1 calling  -----------  ");
        console.log(" createRoom  on ::  ", data);
        var create_room = await createRoom(data);

        socket.join(create_room);

        v1version.to(create_room).emit("createRoom", create_room);
      } catch (error) {
        console.log("=== createRoom ===", error);
      }
    });
    socket.on("chatUserList", async (data) => {
      try {
        let chatUserData = await chatUserList(data);

        socket.emit("chatUserList", chatUserData);
      } catch (error) {
        console.log("=== chatUserList ===", error);
      }
    });

    socket.on("sendMessage", async (data) => {
      try {
        console.log(" -----------  v1 calling  -----------  ");
        console.log("sendMessage  on ::  ", data);
        socket.join(data.chat_room_id);

        var send_messages = await sendMessage(data);
        v1version.to(data.chat_room_id).emit("sendMessage", send_messages);

        const aggregationPipeline = [
          {
            $match: {
              user_id: new mongoose.Types.ObjectId(data.sender_id),
              is_deleted: false,
            },
          },
          {
            $match: {
              socket_id: { $ne: null },
            },
          },
          {
            $project: {
              socket_id: 1,
            },
          },
        ];

        const sender_user_socket = await user_session.aggregate(
          aggregationPipeline
        );

        console.log("sender_user_socket", sender_user_socket);
      } catch (error) {
        console.log("=== sendMessage ===", error);
      }
    });

    socket.on("setSocketId", async (data) => {
      try {
        console.log(" -----------  v1 setSocketId  -----------  ", socket.id);
        var socket_data = socket.id;
        data = {
          ...data,
          socket_data,
        };
        let setSocketData = await setSocketId(data);
        socket.emit("setSocketId", setSocketData);
      } catch (error) {
        console.log("=== setSocketId ===", error.message);
      }
    });

    socket.on("screenUserCheck", async (data) => {
      try {
        let chat_room_data = await screenUserCheck(data);

        socket.emit("screenUserCheck", chat_room_data);
      } catch (error) {
        console.log("=== screenUserCheck ===", error.message);
      }
    });

    socket.on("getAllMessage", async (data) => {
      try {
        socket.join(data.chat_room_id);

        let allMessageList = await getAllMessage(data);
        socket.emit("getAllMessage", allMessageList);
      } catch (error) {
        console.log("=== getAllMessage ===", error);
      }
    });

    socket.on("unreadMessage", async (data) => {
      try {
        if (
          data.chat_room_id != undefined &&
          data.chat_room_id != null &&
          data.chat_room_id != ""
        ) {
          socket.join(data.chat_room_id);
          let updateMessage = await unreadMessage(data);
          v1version.to(data.chat_room_id).emit("unreadMessage", updateMessage);
        }
      } catch (error) {
        console.log(error.message);
      }
    });

    socket.on("deleteOneChat", async (data) => {
      try {
        console.log(" -----------  v2 deleteOneChat  -----------  ");
        let deleteOneChatData = await deleteOneChat(data);
        socket.emit("deleteOneChat", deleteOneChatData);
      } catch (error) {
        console.log("=== deleteOneChat ===", error);
      }
    });

    socket.on("deleteChat", async (data) => {
      try {
        console.log(" -----------  v2 deleteChat  -----------  ");
        let deleteChatData = await deleteChat(data);
        socket.emit("deleteChat", deleteChatData);
        let sender_data = await users.findById(data.user_id);

        let senderChatUserData = await chatUserList({ user_id: data.user_id });
        socket
          .to(sender_data?.socket_id)
          .emit("chatUserList", senderChatUserData);
      } catch (error) {
        console.log("=== deleteChat ===", error);
      }
    });
  });
};
