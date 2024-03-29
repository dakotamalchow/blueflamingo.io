const mongoose = require("mongoose");
require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SEC_KEY);

const Plan = require("../models/plan");
const BlueFlamingo = require("../models/blueFlamingo");

mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PW}@localhost:27017/blueflamingo?authSource=admin`,
    {useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true,useFindAndModify:false})
    .then(() => {
        console.log("Mongo connection open");
    })
    .catch(error => {
        console.log("Error connecting to Mongo: " + error);
    });

const setupPlans = async(blueFlamingo)=>{
    if(!blueFlamingo.plans.includes("Standard Plan")){
        const product = await stripe.products.create({
            name: "Standard Plan"
        });
        const price = await stripe.prices.create({
            unit_amount: 2400,
            currency: "usd",
            recurring: {interval: "month"},
            product: product.id
        });
        const plan = new Plan({name:"Standard",stripeProduct:product.id,stripePrice:price.id});
        await plan.save();
        blueFlamingo.plans.push(product.name);
        await blueFlamingo.save();
        console.log("Created standard plan");
    };
};

const setupCoupons = async(blueFlamingo)=>{
    if(!blueFlamingo.coupons.includes("one free month")){
        const coupon = await stripe.coupons.create({
            duration: "once",
            id: "1-free-month",
            name: "one free month",
            percent_off: 100
        });
        blueFlamingo.coupons.push(coupon.name);
        await blueFlamingo.save();
        console.log("Created one free month coupon");
    };
    if(!blueFlamingo.coupons.includes("two free months")){
        const coupon = await stripe.coupons.create({
            duration: "repeating",
            duration_in_months: 2,
            id: "2-free-months",
            name: "two free months",
            percent_off: 100
        });
        blueFlamingo.coupons.push(coupon.name);
        await blueFlamingo.save();
        console.log("Created two free months coupon");
    };
};

const setupData = async()=>{
    let blueFlamingo;
    if(!await BlueFlamingo.exists({name:"Blue Flamingo"})){
        blueFlamingo = new BlueFlamingo({name:"Blue Flamingo"});
    }
    else{
        blueFlamingo = await BlueFlamingo.findOne({name:"Blue Flamingo"});
    };
    await setupPlans(blueFlamingo);
    await setupCoupons(blueFlamingo);
};

setupData();
setTimeout(()=>{
    mongoose.connection.close();
    console.log("Mongo connection closed");
},5000);