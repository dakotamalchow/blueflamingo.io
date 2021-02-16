const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,hasPlan} = require("../utils/middleware");
const settings = require("../controllers/settings");

router.get("/",isLoggedIn,hasPlan,catchAsync(settings.index));

router.post("/cancel-subscription",isLoggedIn,hasPlan,catchAsync(settings.cancelSubscrption));

module.exports = router;