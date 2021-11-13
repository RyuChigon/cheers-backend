const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userName: {
    type: String,
    maxlength: 50,
  },
  action: {
    type: String,
    maxlength: 1,
  },
  character: {
    type: String,
    minLength: 1,
  },
  emogee: {
    type: String,
    maxLength: 1,
  },
  position_x: {
    type: Number,
    default: 0,
  },
  position_y:{
    type: Number,
    default: 0,
  },
  team: {
    type: String,
    maxlength:1,
  },
  report: {
    type: Number,
    default: 0,
  }
});


const User = mongoose.model("User", userSchema);

module.exports = { User };