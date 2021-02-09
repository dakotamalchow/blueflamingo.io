const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const stripe = require('stripe')('sk_test_F7a54OYuDnabmUT6HN2pLiDu');

const Invoice = require("../models/invoice");
const Customer = require("../models/customer");
const User = require("../models/user");

mongoose.connect("mongodb://localhost:27017/blueflamingo",
    {useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true,useFindAndModify:false})
    .then(() => {
        console.log("Mongo connection open");
    })
    .catch(error => {
        console.log("Error connecting to Mongo: " + error);
    });

passport.use(new LocalStrategy({usernameField:"email"},User.authenticate()));

const resetAllData = async(user)=>{
    const invoices = await Invoice.find({user});
    // for(let invoice of invoices){
    //     await stripe.invoices.voidInvoice(invoice.stripeInvoice);
    // };
    await Invoice.deleteMany({user});
    const customers = await Customer.find({user});
    for(let customer of customers){
        await stripe.customers.del(customer.stripeCustomer);
    };
    await Customer.deleteMany({user});
};

const createNewCustomer = async(user,name,email)=>{
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
    return customer;
};

const createNewInvoice = async(user,customer,amount,notes)=>{
    const invoiceCount = user.increaseInvoiceCount();
    const invoiceNumber = String(invoiceCount).padStart(4,"0");
    const invoice = new Invoice({user,customer,invoiceNumber});
    await stripe.invoiceItems.create({
        customer: customer.stripeCustomer,
        amount: amount*100,
        currency: "usd",
        description: notes
    });
    const stripeInvoice = await stripe.invoices.create({
        customer: customer.stripeCustomer,
        transfer_data:{
            destination:user.stripeAccount
        },
        collection_method: "send_invoice",
        days_until_due: 30,
        metadata:{
            invoiceId: invoice.id,
            invoiceNumber: invoiceNumber
        }
    });
    invoice.stripeInvoice = stripeInvoice.id;
    await invoice.save();
    await stripe.invoices.sendInvoice(invoice.stripeInvoice);
};

const seedDatabase = async()=>{
    console.log("seeding...");
    const richardsConstruction = await User.findOne({businessName:"Richard's Construction"});
    await resetAllData(richardsConstruction);
    console.log("Deleted old data");
    const dakota = await createNewCustomer(richardsConstruction,"Dakota Malchow","dakotamalchow@gmail.com");
    console.log("Created new customer Dakota");
    const tessa = await createNewCustomer(richardsConstruction,"Tessa Malchow","tessamalchow@gmail.com");
    console.log("Created new customer Tessa");
    await createNewInvoice(richardsConstruction,dakota,500,"Installed new front and back door");
    console.log("Created invoice 1");
    await createNewInvoice(richardsConstruction,tessa,250,"Put shingles on dog house");
    console.log("Created invoice 2");
    await createNewInvoice(richardsConstruction,dakota,2200,"Installed new windows");
    console.log("Created invoice 3");
};

const closeConnections = ()=>{
    mongoose.connection.close();
    console.log("Mongo connection closed");
    process.exit(1);
};

setTimeout(seedDatabase,2500);
setTimeout(closeConnections,12500);