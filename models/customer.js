const mongoose = require("mongoose");
const {Schema} = mongoose;

const customerSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("invoice",customerSchema);