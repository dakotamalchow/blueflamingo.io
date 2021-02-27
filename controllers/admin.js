const User = require("../models/user");

module.exports.index = (req,res)=>{
    res.render("admin/index");
};

module.exports.usersIndex = async(req,res)=>{
    const users = await User.find();
    res.render("admin/users/index",{users});
};