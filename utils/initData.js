const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');

const Plan = require("../models/plan");
const BlueFlamingo = require("../models/blueFlamingo");

let isDataSetup = false;

const setupPlans = async()=>{
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
    await stripe.coupons.create({
        duration: "once",
        id: "1-free-month",
        name: "one free month",
        percent_off: 100
    });
    await stripe.coupons.create({
        duration: "repeating",
        duration_in_months: 2,
        id: "2-free-months",
        name: "two free months",
        percent_off: 100
    });
};

module.exports.setupData = async()=>{
    if(!isDataSetup){
        if(!await BlueFlamingo.exists({name:"Blue Flamingo"})){
            const blueFlamingo = new BlueFlamingo({name:"Blue Flamingo"});
            await setupPlans();
            await setupCoupons();
            blueFlamingo.hasPlans = true;
            blueFlamingo.hasCoupons = true;
            await blueFlamingo.save();
            isDataSetup = true;
        }
        else{
            const blueFlamingo = await BlueFlamingo.findOne({name:"Blue Flamingo"});
            if(!blueFlamingo.hasPlans){
                await setupPlans();
                blueFlamingo.hasPlans = true;
                await blueFlamingo.save();
            };
            if(!blueFlamingo.hasCoupons){
                await setupCoupons();
                blueFlamingo.hasCoupons = true;
                await blueFlamingo.save();
            };
            isDataSetup = true;
        };
    };
};