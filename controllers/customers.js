const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');

const Customer = require("../models/customer");

module.exports.index = async(req,res)=>{
    const user = res.locals.currentUser;
    req.session.returnTo = req.originalUrl;
    const customers = await Customer.find({user});
    let stripeCustomers = [];
    for (let customer of customers){
        let stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomer);
        stripeCustomers.push(stripeCustomer);
    };
    res.render("customers/index",{stripeCustomers});
};

module.exports.newForm = (req,res)=>{
    const returnToUrl = req.session.returnTo || "/customers";
    delete req.session.returnTo;
    res.render("customers/new",{returnToUrl});
};

module.exports.createCustomer = async(req,res,next)=>{
    const {name,email} = req.body;
    const user = res.locals.currentUser;
    const customer = new Customer({user,name,email});
    const stripeCustomer = await stripe.customers.create({
        name,
        email,
        metadata:{
            customerId: customer.id
        }
    });
    customer.stripeCustomer = stripeCustomer.id;
    await customer.save();
    req.flash("success","Successfully created new customer");
    res.redirect("/invoices/new");
};

module.exports.customerDetails = async(req,res)=>{
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);
    const stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomer);
    res.render("customers/details",{stripeCustomer});
};

module.exports.editForm = async(req,res)=>{
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);
    const stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomer);
    res.render("customers/edit",{stripeCustomer});
};

module.exports.editCustomer = async(req,res)=>{
    const customerId = req.params.id;
    const {name,email} = req.body;
    const customer = await Customer.findByIdAndUpdate(customerId,{name,email},{new:true});
    await stripe.customers.update(customer.stripeCustomer,
        {name,email}
    );
    req.flash("success","Customer successfully saved");
    res.redirect(`/customers/${customer._id}`);
};