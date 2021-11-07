const express = require("express");
const app = express();
const port = 9000;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { User } = require("./models/user");
const { Score } = require("./models/score");
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
  var userList = mongoose.model('User');
  if(user.userName == ""){
    return res.status(200).json({ success: true });
  }
  userList.findOne({userName: user.userName}, function(err, sameUser){
      if(err){
        return res.json({ success: false, err });
      }else {
        if(sameUser != null){ //이미 같은 유저가 디비에 있을떄
          console.log("same user");
          return res.json(
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

app.post("/api/user/modifyuser", async(req, res) => {
  res.set('Access-Control-Allow-Credentials', 'true');
  res.header("Access-Control-Allow-Origin", req.headers.origin);

  const user = new User(req.body);
  var userList = mongoose.model('User');
  if(user.userName == ""){
    return res.status(200).json({ success: true });
  }

  userList.findOneAndUpdate( {userName: user.userName}, {character: user.character, team: user.team}, (err, userInfo) => {
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

// app.use(cors({credentials: true, origin: 'http://192.249.28.102:3002'}));
app.use(cors({credentials: true, origin: 'http://localhost:3002'})); 
app.listen(port, () => console.log(`listening on port ${port}`));

//for streaming
// const nms = require('./streaming');
// nms.run();

//for socket io
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    // origin: "http://192.249.28.102:3002",
    origin: "http://localhost:3002",
    methods: ["GET", "POST"],
  },
  'pingInterval': 2000, 
  'pingTimeout': 6000000,
});

io.on("connection", (socket) => {
  console.log("connection");
  socket.on("init_chat", (payload) => {
    console.log(payload);
  });
  socket.on('msg-snd', item => {
    console.log('(msg-snd) sended from ' + item.name + ': [ ' + item.message + ' ]');
    io.emit('msg-rcv', {name: item.name, message: item.message});
  });
  socket.on('move-snd', item => {
    //update mongodb
  var userList = mongoose.model('User');
  userList.findOneAndUpdate( {userName: item.name}, {position_x: item.movement[0], position_y: item.movement[1]}, (err, userInfo) => {
    if (err) return res.json({ success: false, err });
  });
    console.log('(move-snd) sended from ' + item.name + ': [ ' + item.movement + ' ]');
    io.emit('move-rcv', {name: item.name, movement: item.movement});
  });
  socket.on('emogee-snd', item => {
      //update mongodb
    var userList = mongoose.model('User');
    userList.findOneAndUpdate( {userName: item.name}, {emogee: item.emogee}, (err, userInfo) => {
      if (err) return res.json({ success: false, err });
    });
    console.log('(emogee-snd) sended from ' + item.name + ': [ ' + item.emogee + ' ]');
    io.emit('emogee-rcv', {name: item.name, emogee: item.emogee});
  });
  socket.on('cheer-snd', item => {
    console.log('(cheer-snd) sended from ' + item.name + ': [ ' + item.cheer + ' ]');
    console.log(item.name + ' a_team: [' +  item.a_score + '] ' + 'b_team: [' + item.b_score + ']');
    io.emit('cheer-rcv', {name: item.name, cheer: item.cheer, a_score: item.a_score, b_score: item.b_score});
});
socket.on('minigame-cheer-snd', item => {
  console.log('(minigame-cheer-snd) sended from ' + item.name + ': [ ' + item.cheer + ' ]');
    if (item.cheer == '1'){
      var ScoreList = mongoose.model('Score');
      ScoreList.updateMany({}, {a_score: item.a_score, b_score: item.b_score}, function(err, CurrTeam){
        if(err){
          console.log('failed to find from: ' + item.name);
        }
      });
      console.log(item.name + '(minigame-cheer-snd) a_team: [' +  item.a_score + '] ' + 'b_team: [' + item.b_score + ']');
      io.emit('minigame-cheer-rcv', {name: item.name, cheer: item.cheer, a_score: item.a_score, b_score: item.b_score});
  }else{
    console.log(item.name + '(minigame-cheer-snd) a_team: [' +  item.a_score + '] ' + 'b_team: [' + item.b_score + ']');
    io.emit('minigame-cheer-rcv', {name: item.name, cheer: item.cheer, a_score: item.a_score, b_score: item.b_score});
  }
});
});

httpServer.listen(80);