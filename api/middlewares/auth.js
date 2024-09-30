const jwt = require("jsonwebtoken");
const users = require("../models/M_user");
const user_session = require("../models/M_user_session");

const { errorRes, authFailRes } = require("../../utils/common_fun");

const verifyToken = async (req, res, next) => {
  try {
    const bearerHeader = req.headers["authorization"];

    if (!bearerHeader) {
      return errorRes(res, `A token is required for authentication.`);
    }

    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];

    const { id } = jwt.verify(bearerToken, process.env.TOKEN_KEY);

    const findUserSession = await user_session.findOne({
      user_id: id,
      auth_token: bearerToken,
      is_deleted: false,
      is_login: true,
      // is_active: true,
    });  
    
    if (!findUserSession) {
      return await authFailRes(res, "Authentication failed.");
    }

    const findUsers = await users.findById(id).where({
      is_deleted: false,
      is_login: true,
      // is_active: true,
    });  

    
    if (!findUsers) {
      return await authFailRes(res, "Authentication failed.");
    }
    req.user = findUsers;
    next();
  } catch (error) {
    if (error.message == "jwt malformed") {
      return await authFailRes(res, "Authentication failed.");
    }

    console.log("jwt::::::::::", error.message);
    return await errorRes(res, "Internal server error");
  }
};

module.exports = verifyToken;
