const tzlookup = require("tz-lookup");

const moment = require("moment-timezone");

const successRes = async (res, msg, data) => {
  return res.send({
    success: true,
    statuscode: 1,
    message: msg,
    data: data,
  });
};

const warningRes = async (res, msg, data) => {
  return res.send({
    success: false,
    statuscode: 2,
    message: msg,
  });
};

const multiSuccessRes = async (res, msg, data, total_count) => {
  return res.send({
    success: true,
    statuscode: 1,
    message: msg,
    total_number_of_data: total_count,
    data: data,
  });
};

const manyMultiSuccessRes = async (res, msg, data, total_count, page_count) => {
  return res.send({
    success: true,
    statuscode: 1,
    message: msg,
    total_number_of_data: total_count,
    page_no_count: page_count,
    data: data,
  });
};

const errorRes = async (res, msg) => {
  return res.send({
    success: false,
    statuscode: 0,
    message: msg,
  });
};

const authFailRes = async (res, msg) => {
  return res.status(401).json({
    success: false,
    statuscode: 101,
    message: msg,
  });
};

const webAuthFailRes = async (res, msg) => {
  return res.send({
    success: false,
    statuscode: 101,
    message: msg,
  });
};

const statusSuccessRes = async (res, msg, data, any_status) => {
  return res.send({
    success: true,
    statuscode: 1,
    message: msg,
    any_status: any_status,
    data: data,
  });
};

module.exports = {
  successRes,
  warningRes,
  errorRes,
  authFailRes,
  webAuthFailRes,
  multiSuccessRes,
  statusSuccessRes,
  manyMultiSuccessRes,
};
