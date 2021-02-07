const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const AppError = require("./utils/AppError");
const User = require("./models/user");
const invoiceRoutes = require("./routes/invoices");
const customerRoutes = require("./routes/customers");
const userRoutes = require("./routes/users");

mongoose.connect("mongodb://localhost:27017/blueflamingo",
    {useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true,useFindAndModify:false})
    .then(() => {
        console.log("Mongo connection open");
    })
    .catch(error => {
        console.log("Error connecting to Mongo: " + error);
    });

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.engine("ejs",ejsMate);

app.use("/imgs",express.static(path.join(__dirname,"/public/imgs")));
app.use("/css",express.static(path.join(__dirname,"/public/css")));
app.use("/js",express.static(path.join(__dirname,"/public/js")));
app.use("/bootstrap-css", express.static(path.join(__dirname,"node_modules/bootstrap/dist/css")));
app.use("/bootstrap-js", express.static(path.join(__dirname,"node_modules/bootstrap/dist/js")));
app.use("/jquery-js", express.static(path.join(__dirname,"node_modules/jquery/dist")));

app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(methodOverride("_method"));
app.use(session({
    secret:"BlueFlamingoTest",
    resave:false,
    saveUninitialized:true
}));
app.use(passport.initialize());
app.use(passport.session());
//use email to login instead of a username (set in user model as well)
passport.use(new LocalStrategy({usernameField:"email"},User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    next();
});

app.use("/invoices",invoiceRoutes);
app.use("/customers",customerRoutes);
app.use("/",userRoutes);

app.get("/",(req,res)=>{
    res.render("index");
});

app.all("*",(req,res,next)=>{
    next(new AppError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
    const {status=500} = err;
    if(!err.message) err.message = "Error encountered";
    res.status(status).render("error",{err});
});

app.listen(3000,()=>{
    console.log("App is listening on Port 3000");
});