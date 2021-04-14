const mongoose = require("mongoose");
const {Schema} = mongoose;

const taxSchema = new Schema({
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
    }
});

module.exports = mongoose.model("Tax",taxSchema);