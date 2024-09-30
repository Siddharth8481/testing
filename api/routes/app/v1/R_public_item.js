const router = require("express").Router();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const userAuth = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");

const {
  getAllPublicItemsDto,
  getPublicItemDetailsDto,
  addItemOnsaleDto,
  removeItemfromSaleDto,
} = require("../../../dto/app/v1/public_item_dto");

const {
  addItemOnsale,
  removeItemfromSale,
  getAllPublicItems,
  getPublicItemDetails,
} = require("../../../controller/app/v1/C_public_item");

router.post(
  "/add_item_onsale",
  userAuth,
  multipartMiddleware,
  validateRequest(addItemOnsaleDto),
  addItemOnsale
);

router.post(
  "/remove_item_fromsale",
  userAuth,
  multipartMiddleware,
  validateRequest(removeItemfromSaleDto),
  removeItemfromSale
);

router.post(
  "/get_all_public_items",
  userAuth,
  multipartMiddleware,
  validateRequest(getAllPublicItemsDto),
  getAllPublicItems
);

router.post(
  "/get_public_item_details",
  userAuth,
  multipartMiddleware,
  validateRequest(getPublicItemDetailsDto),
  getPublicItemDetails
);

module.exports = router;
