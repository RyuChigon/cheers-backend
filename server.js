const express = require("express");
const app = express();
const port = 9000;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { User } = require("./models/user");
const cors = require('cors');
const nms = require('./streaming');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const dbAddress = "mongodb+srv://KSB21ST:5735@cluster0.hmvzn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// let db = mongoose.connection.User;
// let user_coll = db.User;
// db.on("error", console.error);
// db.once("open", function() {
//   console.log("Connected to mongod server");
// });

mongoose
  .connect(dbAddress, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


// app.get("/", (req, res) => res.send("Hello world!!!!"));

app.post("/api/user/register", async(req, res) => {
  res.set('Access-Control-Allow-Credentials', 'true');
  res.header("Access-Control-Allow-Origin", req.headers.origin);

  const user = new User(req.body);
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});
app.use(cors({credentials: true, origin: 'http://localhost:3002'}));
app.listen(port, () => console.log(`listening on port ${port}`));
nms.run();