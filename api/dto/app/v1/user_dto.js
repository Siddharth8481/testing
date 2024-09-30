const joi = require("joi");

const userSignUpDto = joi.object().keys({
  full_name: joi.string().required().label("Full name"),
  user_type: joi
    .string()
    .required()
    .valid("user", "admin", "employee")
    .label("User type"),
  email_address: joi.string().email().required().label("Email address"),
  password: joi.string().required().label("Password"),
  device_type: joi
    .string()
    .required()
    .valid("web", "ios", "android")
    .label("Device type"),
  device_token: joi.string().required().label("Device token"),
});

const userSignInDto = joi.object().keys({
  email_address: joi.string().email().required().label("Email address"),
  password: joi.string().required().label("Password"),
  device_type: joi
    .string()
    .required()
    .valid("web", "ios", "android")
    .label("Device type"),
  device_token: joi.string().required().label("Device token"),
});

const forgetPasswordDto = joi.object().keys({
  email_address: joi.string().email().required().label("Email address"),
});

const editProfileDto = joi.object().keys({
  full_name: joi.string().allow().label("Full name"),
  user_id: joi.string().allow().label("User id"),
  profile_picture: joi.string().allow().label("Profile picture"),
});

const logOutDto = joi.object().keys({
  device_token: joi.string().required().label("Device token"),
  user_id: joi.string().allow().label("User id"),
});

const selfDeleteDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
});

const changePasswordDto = joi.object().keys({
  new_password: joi.string().required().label("New password"),
  user_id: joi.string().allow().label("User id"),
});

const addCreditDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  amount: joi.number().required().label("Amount"),
});

const addAddressDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  address_name: joi.string().required().label("Address name"),
  country_code: joi.string().allow().label("Country code"),
  contact_number: joi.string().required().label("Contact number"),
  is_primary: joi.boolean().allow().label("Is primary"),
  address: joi.string().allow().required("Address"),
});
const editAddressDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  address_id: joi.string().required().label("Address id"),
  // address_name : joi.string().allow().label("Address name"),
  country_code: joi.string().allow().label("Country code"),
  contact_number: joi.number().allow().label("Contact number"),
  address: joi.string().allow().label("Address"),
  is_primary: joi.boolean().allow().label("Is primary"),
});

const addressListDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
});

const getUserDetailsDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
});

const getAddressDto = joi.object().keys({
  address_id: joi.string().required().label("Address id"),
  user_id: joi.string().allow().label("User id"),
});

const selectAddressDto = joi.object().keys({
  address_id: joi.string().required().label("Address id"),
  user_id: joi.string().allow().label("User id"),
});

const deleteAddressDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  address_id: joi.string().required().label("Address id"),
});

module.exports = {
  userSignUpDto,
  userSignInDto,
  forgetPasswordDto,
  editProfileDto,
  selfDeleteDto,
  logOutDto,
  changePasswordDto,
  getUserDetailsDto,
  addCreditDto,
  addAddressDto,
  editAddressDto,
  addressListDto,
  getAddressDto,
  selectAddressDto,
  deleteAddressDto,
};
