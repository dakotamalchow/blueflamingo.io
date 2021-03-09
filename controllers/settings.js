const stripe = require('stripe')(process.env.STRIPE_SEC_KEY);

module.exports.index = async(req,res)=>{
    const user = res.locals.currentUser;
    const stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscription);
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(user.stripePaymentMethod);
    res.render("settings/index",{user,stripeSubscription,stripePaymentMethod});
};

module.exports.editUserForm = (req,res)=>{
    const user = res.locals.currentUser;
    res.render("settings/edit-user",{user});
};

module.exports.editUser = async(req,res)=>{
    const user = res.locals.currentUser;
    const {name,email,businessName} = req.body;
    user.name = name;
    user.email = email;
    user.businessName = businessName;
    await user.save();
    await stripe.accounts.update(user.stripeAccount,
        //can't update the email field, could have wrong email in stripe account
        {business_profile:{name:businessName}}
    );
    req.flash("success","User successfully saved");
    res.redirect("/settings");
};

module.exports.cancelSubscrption = async(req,res)=>{
    const user = res.locals.currentUser;
    user.plan = "Free";
    await user.save();
    await stripe.subscriptions.del(user.stripeSubscription);
    req.flash("success","Subscription was successfully canceled");
    res.redirect("/settings");
};

module.exports.editPaymentMethodForm = (req,res)=>{
    const publicKey = process.env.STRIPE_PUB_KEY;
    res.render("settings/edit-payment-method",{publicKey});
};

module.exports.editPaymentMethod = async(req,res)=>{
    const user = res.locals.currentUser;
    const {paymentMethodId} = req.body;
    await stripe.paymentMethods.attach(paymentMethodId,{customer:user.stripeCustomer});
    await stripe.customers.update(user.stripeCustomer,{
        invoice_settings: {
            default_payment_method: paymentMethodId
          }
    });
    user.stripePaymentMethod = paymentMethodId;
    await user.save();
    req.flash("success","Payment method successfully saved");
    res.redirect("/settings");
};