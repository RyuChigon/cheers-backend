const mongoose = require("mongoose");

const dbAddress = "mongodb+srv://KSB21ST:5735@cluster0.hmvzn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose
  .connect(dbAddress, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

module.exports = mongoose;