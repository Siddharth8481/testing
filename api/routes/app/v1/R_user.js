const router = require("express").Router();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const userAuth = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");

const {
  userSignUpDto,
  userSignInDto,
  forgetPasswordDto,
  editProfileDto,
  logOutDto,
  changePasswordDto,
  addCreditDto,
  addAddressDto,
  editAddressDto,
  addressListDto,
  getUserDetailsDto,
  selfDeleteDto,
  getAddressDto,
  selectAddressDto,
  deleteAddressDto,
} = require("../../../dto/app/v1/user_dto");

const {
  signUp,
  signIn,
  forgotPassword,
  getUserDetails,
  editProfile,
  logout,
  selfDelete,
  changePassword,
  addCredit,
  addAddress,
  getAddress,
  editAddress,
  addressList,
  deleteAddress,
  selectAddress,
} = require("../../../controller/app/v1/C_user");

router.post(
  "/sign_up",
  multipartMiddleware,
  validateRequest(userSignUpDto),
  signUp
);

router.post(
  "/sign_in",
  multipartMiddleware,
  validateRequest(userSignInDto),
  signIn
);

router.post(
  "/user_details",
  userAuth,
  multipartMiddleware,
  validateRequest(getUserDetailsDto),
  getUserDetails
);

router.post(
  "/forgot_password",
  multipartMiddleware,
  validateRequest(forgetPasswordDto),
  forgotPassword
);

router.post(
  "/edit_profile",
  userAuth,
  multipartMiddleware,
  validateRequest(editProfileDto),
  editProfile
);

router.post(
  "/logout",
  userAuth,
  multipartMiddleware,
  validateRequest(logOutDto),
  logout
);

router.post(
  "/self_delete",
  userAuth,
  multipartMiddleware,
  validateRequest(selfDeleteDto),
  selfDelete
);

router.post(
  "/change_password",
  userAuth,
  multipartMiddleware,
  validateRequest(changePasswordDto),
  changePassword
);

router.post(
  "/add_credit",
  userAuth,
  multipartMiddleware,
  validateRequest(addCreditDto),
  addCredit
);

router.post(
  "/add_address",
  userAuth,
  multipartMiddleware,
  validateRequest(addAddressDto),
  addAddress
);

router.post(
  "/get_address",
  userAuth,
  multipartMiddleware,
  validateRequest(getAddressDto),
  getAddress
);

router.post(
  "/edit_address",
  userAuth,
  multipartMiddleware,
  validateRequest(editAddressDto),
  editAddress
);

router.post(
  "/address_list",
  userAuth,
  multipartMiddleware,
  validateRequest(addressListDto),
  addressList
);

router.post(
  "/delete_address",
  userAuth,
  multipartMiddleware,
  validateRequest(deleteAddressDto),
  deleteAddress
);

router.post(
  "/select_address",
  userAuth,
  multipartMiddleware,
  validateRequest(selectAddressDto),
  selectAddress
);

module.exports = router;




