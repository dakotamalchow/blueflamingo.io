const Item = require("../models/item");

module.exports.index = async(req,res)=>{
    const user = res.locals.currentUser;
    req.session.returnTo = req.originalUrl;
    const {sortBy,sortOrder} = req.query;
    sortQuery = {};
    sortQuery[sortBy] = sortOrder;
    const items = await Item.find({user}).sort(sortQuery);
    res.render("items/index",{items});
};

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

module.exports.itemDetails = async(req,res)=>{
    const itemId = req.params.id;
    const item = await Item.findById(itemId);
    res.render("items/details",{item});
};

module.exports.editForm = async(req,res)=>{
    const itemId = req.params.id;
    const item = await Item.findById(itemId);
    res.render("items/edit",{item});
};

module.exports.editItem = async(req,res)=>{
    const itemId = req.params.id;
    const {description,amount} = req.body;
    const item = await Item.findByIdAndUpdate(itemId,{description,amount},{new:true});
    req.flash("success","Item successfully saved");
    res.redirect(`/items/${item._id}`);
};