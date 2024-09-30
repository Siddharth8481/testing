const axios = require("axios");

module.exports = {
  generateDynamicLink: async (data) => {
    // Send push notification code.
    // var { provider_id, event_id, service_id } = data;

    var shareWeblink =
      "https://stage.ad-anima.com/provider_details/660bd78d80ebf8d06014f54d/660be842d78071af60489542";

    // const links = `https://adanima.page.link?${typeKey}=${typeSharing}&${
    //   typeSharing === serviceTypeKey
    //     ? `${userIdKey}=${data?._id}&${milesDistanceKey}=${data?.miles_distance}&${isSaveStatusKey}=${""}&${serviceIdKey}=${serviceId}`
    //     : typeSharing === bookingTypeKey
    //       ? `${userIdKey}=${data?.user_id}&${serviceIdKey}=${data?._id}`
    //       : `${eventIdKey}=${eventId}`
    // }`;

    var links =
      "https://stage.ad-anima.com/provider_details/660bd78d80ebf8d06014f54d/660be842d78071af60489542";

    // Request body containing the dynamic link parameters
    const requestBody = {
      dynamicLinkInfo: {
        domainUriPrefix: "https://adanima.page.link",
        link: links,
        androidInfo: {
          androidPackageName: "com.app.adanima",
          androidFallbackLink: shareWeblink,
        },
        iosInfo: {
          iosBundleId: "com.app.adanima",
          iosFallbackLink: shareWeblink,
        },
        desktopInfo: {
          desktopFallbackLink: shareWeblink,
        },
      },
    };

    let response = await axios.post(
      `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.FIREBASE_KEY}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      "generateDynamicLink   firebase dynamic link -- ",
      response.data.shortLink
    );

    return response.data.shortLink;
  },
};
