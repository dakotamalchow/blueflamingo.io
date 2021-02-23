const Item = require("../models/item");

module.exports.newForm = async(req,res)=>{
    const returnToUrl = req.session.returnTo || "/items";
    delete req.session.returnTo;
    res.render("items/new",{returnToUrl});
};

module.exports.saveItem = async(req,res)=>{
    const {description,amount,returnToUrl} = req.body;
    const user = res.locals.currentUser;
    const item = new Item({user,description,amount});
    await item.save();
    req.flash("success","Successfully saved new item");
    res.redirect(returnToUrl);
};