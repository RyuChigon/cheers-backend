const express = require("express");
const app = express();
const port = 9000;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { User } = require("./models/user");
const cors = require('cors');

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
  const _user = new User(req.body);
  var userList = mongoose.model('User');
  if(user.userName == ""){
    return res.status(200).json({ success: true });
  }
  userList.findOne({userName: user.userName}, function(err, sameUser){
      if(err){
        return res.json({ success: false, err });
      }else {
        if(sameUser != null){ //이미 같은 유저가 디비에 있을떄
          return res.status(200).json(
          {
            userName: user.userName,
            action: user.action,
            character: user.character,
            emogee : user.emogee,
            position_x: user.position_x,
            position_y : user.position_y,
            team: user.team
          });
        }
      }
    })
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json(
    {
      userName: user.userName,
      action: user.action,
      character: user.character,
      emogee : user.emogee,
      position_x: user.position_x,
      position_y : user.position_y,
      team: user.team
    });
  });
});

app.get("/api/user/users", async(req, res) => {
  res.set('Access-Control-Allow-Credentials', 'true');
  res.header("Access-Control-Allow-Origin", req.headers.origin);

  const users = await User.find({});
  res.json(users);
});

app.use(cors({credentials: true, origin: 'http://localhost:3002'}));
app.listen(port, () => console.log(`listening on port ${port}`));