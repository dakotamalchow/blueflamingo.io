const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,hasPlan} = require("../utils/middleware");
const settings = require("../controllers/settings");

router.get("/",isLoggedIn,hasPlan,catchAsync(settings.index));

router.get("/edit-user",isLoggedIn,hasPlan,settings.editUserForm);

router.post("/edit-user",isLoggedIn,hasPlan,catchAsync(settings.editUser));

router.post("/cancel-subscription",isLoggedIn,hasPlan,catchAsync(settings.cancelSubscrption));

module.exports = router;