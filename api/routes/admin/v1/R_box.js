const router = require("express").Router();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();

const {
    add_box_types,
    add_box_subscription,
    add_box_features,
    box_type_list,
    subscription_list,
    feature_list,
}=require("../../../controller/admin/v1/C_box")

router.post("/add_box_types", multipartMiddleware, add_box_types);

router.post("/add_box_subscription", multipartMiddleware, add_box_subscription);

router.post("/add_box_features", multipartMiddleware, add_box_features);

router.post("/box_type_list",multipartMiddleware, box_type_list);

router.post("/subscription_list", multipartMiddleware,subscription_list);

router.post("/feature_list",multipartMiddleware, feature_list);

module.exports = router;