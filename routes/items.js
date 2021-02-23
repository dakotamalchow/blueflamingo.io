const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,hasPlan,isAccountComplete} = require("../utils/middleware");
const items = require("../controllers/items");

router.get("/new",isLoggedIn,hasPlan,isAccountComplete,catchAsync(items.newForm));

router.post("/",isLoggedIn,hasPlan,isAccountComplete,catchAsync(items.saveItem));

module.exports = router;