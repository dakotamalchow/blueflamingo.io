const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isStripeVerified,hasPlan} = require("../utils/middleware");
const items = require("../controllers/items");

router.get("/new",isLoggedIn,isStripeVerified,hasPlan,catchAsync(items.newForm));

router.post("/",isLoggedIn,isStripeVerified,hasPlan,catchAsync(items.saveItem));

module.exports = router;