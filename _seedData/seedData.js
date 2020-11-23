const mongoose = require("mongoose");
const Product = require("../models/product");

mongoose.connect("mongodb://localhost:27017/blueflamingo",{useNewUrlParser:true,useUnifiedTopology:true})
    .then(() => {
        console.log("Mongo connection open");
    })
    .catch(error => {
        console.log("Error connecting to Mongo: " + error);
    });

const seedDataProducts = [
    {
        name:"Spring Roll",
        price:4.25,
        description:"Stuffed with clear noodles and vegetables in rice paper, deep fried and served with a sweet and sour sauce.",
        picture:"/img/spring_roll.jpeg",
        category:"Appetizers"
    },
    {
        name:"Crab Rangoon",
        price:4.25,
        description:"Cream cheese, crab, green scallions, wrapped in a wonton wrapper and served with a sweet and sour sauce.",
        picture:"/img/crab_rangoon.png",
        category:"Appetizers"
    },
    {
        name:"Steamed Dumplings",
        price:5.25,
        description:"Seasoned shrimp, chicken, mushrooms and bamboo shoots topped with fried garlic and served with black bean sauce.",
        picture:"/img/steamed_dumplings.jpeg",
        category:"Appetizers"
    },
    {
        name:"Red Curry",
        price:10.18,
        description:"Made with coconut milk, bamboo shoots, basil leaves and bell peppers.",
        picture:"/img/red_curry.png",
        category:"Curries"
    },
    {
        name:"Panang Curry",
        price:10.18,
        description:"Made with coconut milk, basil leaves, bell pepper,peas, carrot, and peanut sauce.",
        picture:"/img/panang_curry.jpeg",
        category:"Curries"
    },
    {
        name:"Yellow Curry",
        price:11.50,
        description:"Made with coconut milk. Choice of chicken or tofu only. Comes with cooked egg noodles and a crispy egg noodle garnish on top.",
        picture:"/img/yellow_curry.jpeg",
        category:"Curries"
    },
    {
        name:"Mixed Vegetables",
        price:10.18,
        description:"Baby corn, cabbage, broccoli, snow peas, carrots and green beans, stir-fried with a house sauce.",
        picture:"/img/mixed_vegetables.jpeg",
        category:"Entrees"
    },
    {
        name:"Garlic and Black Pepper",
        price:10.18,
        description:"Stir-fried toasted garlic, black pepper, broccoli and garlic sauce.",
        picture:"/img/garlic_and_black_pepper.png",
        category:"Entrees"
    },
    {
        name:"Basil",
        price:10.18,
        description:"Stir-fried with basil leaves, bell pepper and onion.",
        picture:"/img/basil.jpeg",
        category:"Entrees"
    },
    {
        name:"Sweet and Sour",
        price:10.18,
        description:"Stir-fried with sweet and sour sauce, pineapple, onion, bell pepper, tomato and cucumber.",
        picture:"/img/sweet_and_sour.png",
        category:"Entrees"
    },
    {
        name:"Pad Thai",
        price:10.18,
        description:"Stir-fried rice noodles with egg, bean sprouts, and ground peanuts.",
        picture:"/img/pad_thai.jpeg",
        category:"Noodles"
    },
    {
        name:"Pad Woon Sen",
        price:10.18,
        description:"Stir-fried clear noodles with carrots, broccoli, tomato, mushroom, bean sprouts and egg.",
        picture:"/img/pad_woon_sen.jpeg",
        category:"Noodles"
    },
    {
        name:"Pad Kee Mao",
        price:10.18,
        description:"Stir-fried rice noodles with tomato, bell pepper, bamboo shoots, broccoli, egg and basil leaves.",
        picture:"/img/pad_kee_mao.png",
        category:"Noodles"
    } 
];

Product.insertMany(seedDataProducts)
    .then(res=>{
        console.log(res);
    })
    .catch(error=>{
        console.log(error);
    });