const { boolean, string } = require("joi");
const mongoose = require("mongoose");
const {Schema} = mongoose;

const blueFlamingoSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    hasPlans:{
        type: Boolean,
        default: false,
    },
    hasCoupons:{
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model("BlueFlamingo",blueFlamingoSchema)