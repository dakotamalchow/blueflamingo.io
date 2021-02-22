const mongoose = require("mongoose");
const {Schema} = mongoose;

const lineItemSchema = new Schema({
    invoice:{
        type: Schema.Types.ObjectId,
        ref: "Invoice"
    },
    description:{
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("LineItem",lineItemSchema);