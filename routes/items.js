const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isStripeVerified,hasPlan} = require("../utils/middleware");
const items = require("../controllers/items");

router.get("/",isLoggedIn,isStripeVerified,hasPlan,catchAsync(items.index));

router.get("/new",isLoggedIn,isStripeVerified,hasPlan,catchAsync(items.newForm));

router.post("/",isLoggedIn,isStripeVerified,hasPlan,catchAsync(items.saveItem));

router.get("/:id",isLoggedIn,isStripeVerified,hasPlan,catchAsync(items.itemDetails));

router.get("/:id/edit",isLoggedIn,isStripeVerified,hasPlan,catchAsync(items.editForm));

router.post("/:id",isLoggedIn,isStripeVerified,hasPlan,catchAsync(items.editItem));

module.exports = router;