const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');

module.exports.index = async(req,res)=>{
    const user = res.locals.currentUser;
    const stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscription);
    res.render("settings/index",{user,stripeSubscription});
};

module.exports.cancelSubscrption = async(req,res)=>{
    const user = res.locals.currentUser;
    await stripe.subscriptions.del(user.stripeSubscription);
    req.flash("success","Subscription was successfully canceled");
    res.redirect("/settings");
};