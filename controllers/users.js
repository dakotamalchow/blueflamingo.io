const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');

const User = require("../models/user");
const Plan = require("../models/plan");

module.exports.registerForm = (req,res)=>{
    res.render("users/register");
};

module.exports.registerUser = async(req,res,next)=>{
    const {name,businessName,email,password} = req.body;
    const user = new User({name,businessName,email});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser,err=>{
        if(err) {return next(err);}
    });
    req.flash("success","Welcome, account successfully created");
    res.redirect("/register/purchase-plan");
};

module.exports.purchasePlanForm = (req,res)=>{
    res.render("users/purchase-plan");
};

module.exports.purchasePlan = async(req,res)=>{
    const user = res.locals.currentUser;
    const stripeAccount = await stripe.accounts.create({
        type:"express",
        country:"US",
        email: user.email,
        capabilities:{
            card_payments:{requested:true},
            transfers:{requested:true}
        }
    });
    user.stripeAccount = stripeAccount.id;

    const stripeCustomer = await stripe.customers.create({
        name: user.name,
        email: user.email
    });
    const stripeCustomerId = stripeCustomer.id;
    user.stripeCustomer = stripeCustomerId;

    const accountLinks = await stripe.accountLinks.create({
        account:stripeAccount.id,
        refresh_url:"http://localhost:3000",
        return_url:"http://localhost:3000",
        type:"account_onboarding"
    });

    const paymentMethodId = req.body.stripePaymentMethod;
    await stripe.paymentMethods.attach(paymentMethodId,{customer:stripeCustomerId});
    await stripe.customers.update(stripeCustomerId,{
        invoice_settings: {
            default_payment_method: paymentMethodId
          }
    });
    const plan = await Plan.findOne({name:"Standard"});
    console.log("plan",plan);
    const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: plan.stripePrice }]
    });
    user.stripeSubscription = subscription.id;
    await user.save();

    res.redirect(accountLinks.url);
};

module.exports.loginForm = (req,res)=>{
    res.render("users/login");
};

module.exports.loginUser = (req,res)=>{
    const redirectUrl = req.session.returnTo || "/invoices";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req,res)=>{
    req.logOut();
    req.flash("success","User logged out");
    res.redirect("/");
};