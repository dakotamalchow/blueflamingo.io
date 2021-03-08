const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const redis = require("redis");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const dns = require("dns");
require("dotenv").config({path:path.resolve(__dirname,".env")});

const AppError = require("./utils/AppError");
const User = require("./models/user");

const invoiceRoutes = require("./routes/invoices");
const itemRoutes = require("./routes/items");
const customerRoutes = require("./routes/customers");
const userRoutes = require("./routes/users");
const registerRoutes = require("./routes/register");
const settingRoutes = require("./routes/settings");
const adminRoutes = require("./routes/admin");

mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PW}@localhost:27017/blueflamingo?authSource=admin`,
    {useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true,useFindAndModify:false})
    .then(() => {
        console.log("Mongo connection open");
    })
    .catch(error => {
        console.log("Error connecting to Mongo: " + error);
    });

const redisClient = redis.createClient();
redisClient.on("connect",()=>{
    console.log("Connected to Redis");
});

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.engine("ejs",ejsMate);

app.use("/imgs",express.static(path.join(__dirname,"/public/imgs")));
app.use("/css",express.static(path.join(__dirname,"/public/css")));
app.use("/js",express.static(path.join(__dirname,"/public/js")));
app.use("/", express.static(path.join(__dirname,"node_modules")));

app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(methodOverride("_method"));
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    store: new RedisStore({client:redisClient})
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
//use email to login instead of a username (set in user model as well)
passport.use(new LocalStrategy({usernameField:"email"},User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async(req,res,next)=>{
    let err = "";
    dns.lookup("google.com",(dsnErr)=>{
        if(dsnErr && dsnErr.code=="ENOTFOUND"){
            err = new AppError(404,"Couldn't connect to the internet. Please check your connection.");
        };
    });
    setTimeout(async()=>{
        res.locals.currentUser = req.user;
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        next(err);
    },10);
    
});

app.use("/invoices",invoiceRoutes);
app.use("/items",itemRoutes);
app.use("/customers",customerRoutes);
app.use("/",userRoutes);
app.use("/register",registerRoutes);
app.use("/settings",settingRoutes);
app.use("/admin",adminRoutes);

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/pricing-and-details",(req,res)=>{
    res.render("pricing-and-details");
});

app.all("*",(req,res,next)=>{
    next(new AppError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
    const {status=500} = err;
    if(!err.message){
        err.message = "Error encountered";
    };
    res.status(status).render("error",{err});
});

app.listen(3000,()=>{
    console.log("App is listening on Port 3000");
});