const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn} = require("../utils/middleware");
const settings = require("../controllers/settings");

router.get("/",isLoggedIn,catchAsync(settings.index));

router.post("/cancel-subscription",isLoggedIn,catchAsync(settings.cancelSubscrption));

module.exports = router;