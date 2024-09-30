const router = require("express").Router();


let user = require("./R_box");

router.use("/v1/box", user);

module.exports = router;
