const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isAccountComplete,hasPlan} = require("../utils/middleware");
const items = require("../controllers/items");

router.get("/new",isLoggedIn,isAccountComplete,hasPlan,catchAsync(items.newForm));

router.post("/",isLoggedIn,isAccountComplete,hasPlan,catchAsync(items.saveItem));

module.exports = router;