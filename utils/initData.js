const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');

const Plan = require("../models/plan");

let isDataSetup = false;

const setupPlans = async()=>{
    console.log("setting up plans...");
    const product = await stripe.products.create({
        name: 'Standard Plan'
    });
    const price = await stripe.prices.create({
        unit_amount: 4000,
        currency: "usd",
        recurring: {interval: "month"},
        product: product.id
    });
    const plan = new Plan({name:"Standard",stripePrice:price.id});
    await plan.save();
};

const setupCoupons = async()=>{
    console.log("setting up coupons...");
    await stripe.coupons.create({
        duration: "once",
        id: "free-month",
        percent_off: 100
    });
};

module.exports.setupData = async()=>{
    if(!isDataSetup){
        await setupPlans();
        await setupCoupons();
        isDataSetup = true;
        console.log("data is now setup");
    };
}