const mongoose = require("mongoose");
const {Schema} = mongoose;

const blueFlamingoSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    plans:[{
        type: String,
        required: true
    }],
    coupons:[{
        type: String,
        required: true
    }]
});

module.exports = mongoose.model("BlueFlamingo",blueFlamingoSchema)