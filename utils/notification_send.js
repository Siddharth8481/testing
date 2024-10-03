const axios = require("axios");
const serviceAccount = require("../serviceAccount.json");
const { google } = require("googleapis");
const projectId = "majlis-f2f96";
// ..
async function getAccessToken(serviceAccount) {
  const scopes = ["https://www.googleapis.com/auth/firebase.messaging"];
  const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    scopes
  );

  return new Promise((resolve, reject) => {
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}

module.exports = {
  notificationSend: async (notification_data) => {
    const accessToken = await getAccessToken(serviceAccount);
    const {
      device_token,
      noti_title,
      noti_msg,
      noti_for,
      id,
      noti_image,
      details,
      sound_name,
    } = notification_data;

    let messageBody = {
      title: noti_title,
      body: noti_msg,
      noti_for: noti_for,
      id: id,
      sound: sound_name + ".caf",
    };

    if (details != undefined) {
      messageBody.details = details;
    }

    let noti_payload = {
      title: noti_title,
      body: noti_msg,
      // sound: sound_name + '.caf',
    };

    if (noti_image != undefined) {
      noti_payload.image = noti_image;
    }

    const message = {
      message: {
        token: device_token,
        notification: noti_payload,
        data: messageBody,
      },
    };

    try {
      const response = await axios.post(
        "https://fcm.googleapis.com/v1/projects/majlis-f2f96/messages:send",
        message,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response;
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  },

  notiSendMultipleDevice: async (notification_data) => {
    const accessToken = await getAccessToken(serviceAccount);
    const {
      device_token,
      noti_title,
      noti_msg,
      noti_for,
      id,
      noti_image,
      details,
      sound_name,
    } = notification_data;

    for (const value of device_token) {
      let messageBody = {
        title: noti_title,
        body: noti_msg,
        noti_for: noti_for,
        id: id,
        // sound: sound_name + '.caf',
      };

      if (details != undefined) {
        messageBody.details = details;
      }

      let noti_payload = {
        title: noti_title,
        body: noti_msg,
        // sound: sound_name ? sound_name + '.caf' : 'default',
      };

      if (noti_image != undefined) {
        noti_payload.image = noti_image;
      }

      // const message = {
      //   message: {
      //     token: value,
      //     notification: noti_payload,
      //     data: messageBody,
      //   },
      // };

      // const message = {
      //   message: {
      //     token: value,
      //     notification: noti_payload,
      //     data: messageBody,
      //     android: {
      //       notification: {
      //         sound: sound_name ? `${sound_name}.wav` : 'default',
      //         channel_id: sound_name ? `${sound_name}` : 'default',
      //       },
      //     },
      //     apns: {
      //       payload: {
      //         aps: {
      //           sound: sound_name ? `${sound_name}.caf` : 'default',
      //         },
      //       },
      //     },
      //   },
      // };

      const message = {
        message: {
          token: value,
          notification: noti_payload,
          data: messageBody,
          android: {
            notification: {
              sound:
                sound_name && sound_name.toLowerCase() == "none"
                  ? ""
                  : sound_name
                  ? `${sound_name}.wav`
                  : "default",
              channel_id:
                sound_name && sound_name.toLowerCase() == "none"
                  ? "none"
                  : sound_name
                  ? `${sound_name}`
                  : "default",
              // channel_id: sound_name ? `${sound_name}` : 'default',
            },
          },
          apns: {
            payload: {
              aps: {
                sound:
                  sound_name && sound_name.toLowerCase() == "none"
                    ? ""
                    : sound_name
                    ? `${sound_name}.caf`
                    : "default",
                // sound: sound_name ? `${sound_name}.caf` : 'default',
              },
            },
          },
        },
      };

      try {
        await axios.post(
          "https://fcm.googleapis.com/v1/projects/" +
            projectId +
            "/messages:send",
          message,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Notification sent to:", value);
      } catch (error) {
        console.error(
          "Error sending notification to",
          value,
          error.response ? error.response.data : error.message
        );
      }
    }
  },
};
