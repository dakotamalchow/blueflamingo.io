const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const Invoice = require("../models/invoice");
const User = require("../models/user");

mongoose.connect("mongodb://localhost:27017/blueflamingo",
    {useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true,useFindAndModify:false})
    .then(() => {
        console.log("Mongo connection open");
    })
    .catch(error => {
        console.log("Error connecting to Mongo: " + error);
    });

passport.use(new LocalStrategy({usernameField:"email"},User.authenticate()))

const createNewUser = async(name,businessName,email,password)=>{
    const user = new User({name,businessName,email});
    const registeredUser = await User.register(user,password);
    return registeredUser;
};

const createNewInvoice = async(user,name,email,amount,notes,status)=>{
    const invoice = new Invoice({user,name,email,amount,notes,status});
    await invoice.save();
    return invoice;
}

const seedDatabase = async()=>{
    console.log("seeding...");
    await Invoice.deleteMany({});
    await User.deleteMany({});
    const richardsConstruction = await createNewUser("Richard Malchow","Richard's Construction","richardsconstruction@gmail.com","ilovefood123");
    const tessasPlumbing = await createNewUser("Tessa Malchow","Tessa's Plumbing","tessasplumbing@gmail.com","ilovethepark123");
    await createNewInvoice(richardsConstruction._id,"Dakota Malchow","dakotamalchow@gmail.com",500,"Work done on 1 story house","PAID");
    await createNewInvoice(richardsConstruction._id,"Tessa's Plumbing'","tessasplumbing@gmail.com",250,"Work done on doghouse","SENT");
    await createNewInvoice(tessasPlumbing._id,"Dakota Malchow","dakotamalchow@gmail.com",300,"Work done on 1 story house","PAID");
    await createNewInvoice(tessasPlumbing._id,"Richard's Construction","richardsconstruction@gmail.com",350,"Work done at commercial building","SENT");
};

const closeConnections = ()=>{
    mongoose.connection.close();
    console.log("Mongo connection closed");
    process.exit(1);
};

setTimeout(seedDatabase,2500);
setTimeout(closeConnections,5000);