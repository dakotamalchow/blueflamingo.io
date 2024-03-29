const mongoose = require("mongoose");
const {Schema} = mongoose;

const itemSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    description:{
        type: String,
        required: true
    },
    amount:{
        type: Number,
        required: true
    },
    tax:{
        type: Schema.Types.ObjectId,
        ref: "Tax"
    }
});

module.exports = mongoose.model("Item",itemSchema);