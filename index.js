const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

const AppError = require("./utils/AppError");
const invoiceRoutes = require("./routes/invoices");

mongoose.connect("mongodb://localhost:27017/blueflamingo",
    {useNewUrlParser:true,useUnifiedTopology:true})
    .then(() => {
        console.log("Mongo connection open");
    })
    .catch(error => {
        console.log("Error connecting to Mongo: " + error);
    });

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.engine("ejs",ejsMate);

app.use("/css",express.static(path.join(__dirname,"/public/css")));
app.use("/js",express.static(path.join(__dirname,"/public/js")));
app.use("/bootstrap-css", express.static(path.join(__dirname,"node_modules/bootstrap/dist/css")));
app.use("/bootstrap-js", express.static(path.join(__dirname,"node_modules/bootstrap/dist/js")));
app.use("/jquery-js", express.static(path.join(__dirname,"node_modules/jquery/dist")));

app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(methodOverride("_method"));
app.use("/invoices",invoiceRoutes);

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