const express = require("express");
const router = express.Router({mergeParams:true});

const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,isAdmin} = require("../utils/middleware");
const admin = require("../controllers/admin");

router.get("/",isLoggedIn,isAdmin,admin.index);

router.get("/users",isLoggedIn,isAdmin,catchAsync(admin.usersIndex));

module.exports = router;