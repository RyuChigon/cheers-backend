const mongoose = require("mongoose");

const scoreSchema = mongoose.Schema({
    team: {
        type: String,
        maxlength: 2,
    },
    a_score1: {
        type: Number,
        maxlength: 50,
    },
    b_score1: {
        type: Number,
        maxlength: 50,
    },
    a_score2: {
        type: Number,
        maxlength: 50,
    },
    b_score2: {
        type: Number,
        maxlength: 50,
    }
});


const Score = mongoose.model("Score", scoreSchema);

module.exports = { Score };