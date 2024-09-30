const router = require("express").Router();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const userAuth = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");

const {
  buyBoxDto,
  editBoxDto,
  boxListDto,
  boxDetailsDto,
  deleteBoxDto,
  itemDetailsDto,
  boxItemListDto,
  allItemListDto,
  allSaleItemsListsDto,
  addItemDto,
  editItemDto,
  deleteItemDto,
} = require("../../../dto/app/v1/box_dto");

const {
  buyBox,
  editBox,
  boxList,
  boxDetails,
  deleteBox,
  addItem,
  editItem,
  deleteItem,
  itemDetails,
  boxItemList,
  allItemsLists,
  allSale_ItemsList,
} = require("../../../controller/app/v1/C_box");

router.post(
  "/buy_box",
  userAuth,
  multipartMiddleware,
  validateRequest(buyBoxDto),
  buyBox
);

router.post(
  "/edit_box",
  userAuth,
  multipartMiddleware,
  validateRequest(editBoxDto),
  editBox
);

router.post(
  "/box_details",
  userAuth,
  multipartMiddleware,
  validateRequest(boxDetailsDto),
  boxDetails
);

router.post(
  "/box_list",
  userAuth,
  multipartMiddleware,
  validateRequest(boxListDto),
  boxList
);

router.post(
  "/delete_box",
  userAuth,
  multipartMiddleware,
  validateRequest(deleteBoxDto),
  deleteBox
);

router.post(
  "/add_item",
  userAuth,
  multipartMiddleware,
  validateRequest(addItemDto),
  addItem
);

router.post(
  "/edit_item",
  userAuth,
  multipartMiddleware,
  validateRequest(editItemDto),
  editItem
);

router.post(
  "/delete_item",
  userAuth,
  multipartMiddleware,
  validateRequest(deleteItemDto),
  deleteItem
);

router.post(
  "/box_items_list",
  userAuth,
  multipartMiddleware,
  validateRequest(boxItemListDto),
  boxItemList
);

router.post(
  "/item_details",
  userAuth,
  multipartMiddleware,
  validateRequest(itemDetailsDto),
  itemDetails
);

router.post(
  "/all_items_list",
  userAuth,
  multipartMiddleware,
  validateRequest(allItemListDto),
  allItemsLists
);

router.post(
  "/sale_items_list",
  userAuth,
  multipartMiddleware,
  validateRequest(allSaleItemsListsDto),
  allSale_ItemsList
);

module.exports = router;
