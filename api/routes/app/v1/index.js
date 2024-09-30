const router = require("express").Router();

let user = require("./R_user");
let box = require("./R_box");
let publicItem = require("./R_public_item");

router.use("/v1/user", user);
router.use("/v1/box", box);
router.use("/v1/public_item", publicItem);

module.exports = router;
