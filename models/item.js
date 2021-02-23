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
    amount: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Item",itemSchema);