const mongoose = require("mongoose");

const scoreSchema = mongoose.Schema({
    team: {
        type: String,
        maxlength: 2,
        },
    a_score: {
        type: Number,
        maxlength: 50,
    },
    b_score: {
        type: Number,
        maxlength: 50,
    }
});


const Score = mongoose.model("Score", scoreSchema);

module.exports = { Score };