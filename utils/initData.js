const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');

const Plan = require("../models/plan");

module.exports.setupPlans = async()=>{
    const plan = await Plan.findOne({name:"Standard"});
    if(plan == null){
        const product = await stripe.products.create({
            name: 'Standard Plan',
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
};