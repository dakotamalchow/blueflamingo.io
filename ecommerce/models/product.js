const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    description:{
        type: String
    },
    picture:{
        type: String
    },
    category:{
        type: String
    }
});

const Product = mongoose.model("product",productSchema);

module.exports = Product;