const express = require("express");
const router = express.Router({mergeParams:true});

const {isLoggedIn,isAdmin} = require("../utils/middleware");
const admin = require("../controllers/admin");

router.get("/",isLoggedIn,isAdmin,admin.index);

module.exports = router;