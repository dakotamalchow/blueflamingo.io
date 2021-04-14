const Tax = require("../models/tax");

module.exports.index = async(req,res)=>{
    const user = res.locals.currentUser;
    req.session.returnTo = req.originalUrl;
    const {sortBy,sortOrder} = req.query;
    sortQuery = {};
    sortQuery[sortBy] = sortOrder;
    const taxes = await Tax.find({user}).sort(sortQuery);
    res.render("taxes/index",{taxes});
};

module.exports.newForm = async(req,res)=>{
    const returnToUrl = req.session.returnTo || "/taxes";
    delete req.session.returnTo;
    res.render("taxes/new",{returnToUrl});
};

module.exports.saveTax = async(req,res)=>{
    const {description,amount,returnToUrl} = req.body;
    const user = res.locals.currentUser;
    const tax = new Tax({user,description,amount:amount});
    await tax.save();
    req.flash("success","Successfully saved new tax");
    res.redirect(returnToUrl);
};

module.exports.taxDetails = async(req,res)=>{
    const taxId = req.params.id;
    const tax = await Tax.findById(taxId);
    res.render("taxes/details",{tax});
};

module.exports.editForm = async(req,res)=>{
    const taxId = req.params.id;
    const tax = await Tax.findById(taxId);
    res.render("taxes/edit",{tax});
};

module.exports.editTax = async(req,res)=>{
    const taxId = req.params.id;
    const {description,amount} = req.body;
    const tax = await Tax.findByIdAndUpdate(taxId,{description,amount:amount},{new:true});
    req.flash("success","Tax successfully saved");
    res.redirect(`/taxes/${tax._id}`);
};