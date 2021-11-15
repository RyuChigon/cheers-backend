const express = require("express");
const app = express();
const port = 9000;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { User } = require("./models/user");
const { Score } = require("./models/score");
const cors = require('cors');
const nms = require('./streaming');
const fs = require('fs');
const ffmpeg = require('ffmpeg');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const dbAddress = "mongodb+srv://KSB21ST:5735@cluster0.hmvzn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose
  .connect(dbAddress, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


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

let numOfCheers = 0;
let numOfArchive = 0;
let viewpoints = [];

initializeCheers = setInterval(function() {
  numOfCheers = 0;
}, 20000)

app.get("/api/user/cheering", (req, res) => {
  numOfCheers++;
  if (numOfCheers >= 10) {
    numOfCheers = 0;
    const path = './media/live/cheers/';
    fs.readdir(path, function(err, files) {
      const fileName = files[files.length - 1];
      const [ sYear, sMonth, sDate, sHour, sMinute, sSecond ]
        = fileName.split(".")[0].split("-");
      const startTime = new Date(sYear, sMonth - 1, sDate, sHour, sMinute, sSecond);
      const currentTime = new Date();
      const archiveTime = Math.floor(
        ((currentTime.getTime() - startTime.getTime()) / 1000) - 10
      );
      const targetVideo = path + fileName;
      const archivedPath = `../cheers-frontend/src/components/ViewPoint/archive/`
      const archivedVideo = archivedPath + `archived${numOfArchive}.mp4`;

      new ffmpeg( targetVideo, (err, video) => {
        if (!err) {
          video
          .setVideoStartTime(archiveTime)
          .setVideoDuration(10)
          .save(archivedVideo, (err, file) => {
            if (!err) {
              console.log('archive!');
              new ffmpeg( archivedVideo, (err, video) => {
                if (!err) {
                  const img_option = {
                    start_time: 0,
                    number: 1,
                    file_name: `thumbnail${numOfArchive}`
                  };
                  video.fnExtractFrameToJPG(archivedPath, img_option, (err, file) => {
                    if (!err) {
                      console.log('thumbnail complete!');
                      setTimeout(() => {
                        viewpoints.push(numOfArchive);
                        numOfArchive++;
                      }, 3000);
                    };
                  })
                }
              })
            }
          })
        }
      })
    })
  }
  res.set('Access-Control-Allow-Credentials', 'true');
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  return res.json({ success: true });
})

app.get("/api/user/viewpoints", (req, res) => {
  res.set('Access-Control-Allow-Credentials', 'true');
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.json({ viewpoints: viewpoints });
})

app.use(cors({credentials: true, origin: 'http://localhost:3002'})); 
app.listen(port, () => console.log(`listening on port ${port}`));

//for socket io
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
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
    console.log('(msg-snd) sended from ' + item.name + ': [ ' + item.message + ' ]' + item.team);
    io.emit('msg-rcv', {name: item.name, message: item.message, team: item.team});
  });
  socket.on('admin-msg-snd', item => {
    console.log('(admin msg-snd) sended from ' + item.name + ': [ ' + item.message + ' ]' + item.team);
    io.emit('admin-msg-rcv', {name: item.name, message: item.message, team: item.team});
  });
  socket.on('kickout-snd', item => {
    console.log("(kickout-snd) userlist");
    console.log(item);
    item.badUserList.map(user => {
      console.log("(kickout-snd)" + user);
      var userList = mongoose.model('User');
      userList.findOneAndDelete( {userName: user}, (err, userInfo) => {
        if (err) return res.json({ success: false, err });
      });
    })

    io.emit('kickout-rcv', item)
  })
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
    console.log(item.name + ' a_team: [' +  item.a_score1 + '] ' + 'b_team1: [' + item.b_score1 + ']' + 'a_team2: [' + item.a_score2 + ']' + 'b_team2: [' + item.b_score2 + ']');
    io.emit('cheer-rcv', {name: item.name, cheer: item.cheer, a_score1: item.a_score1, b_score1: item.b_score1, a_score2: item.a_score2, b_score2: item.b_score2});
  });
  socket.on('minigame-cheer-snd', item => {
    console.log('(minigame-cheer-snd) sended from ' + item.name + ': [ ' + item.cheer + ' ]');
    if (item.cheer == '1'){
      var ScoreList = mongoose.model('Score');
      ScoreList.updateMany({}, {a_score1: item.a_score1, b_score1: item.b_score1, a_score2: item.a_score2, b_score2: item.b_score2}, function(err, CurrTeam){
        if(err){
          console.log('failed to find from: ' + item.name);
        }
      });
      console.log(item.name + '(minigame-cheer-snd) a_team1: [' +  item.a_score1 + '] ' + 'b_team1: [' + item.b_score1 + ']' + 'a_team2: [' + item.a_score2 + ']' + 'b_team2: [' + item.b_score2 + ']');
      io.emit('minigame-cheer-rcv', {name: item.name, cheer: item.cheer, a_score1: item.a_score1, b_score1: item.b_score1, a_score2: item.a_score2, b_score2: item.b_score2});
    }else{
      console.log(item.name + '(minigame-cheer-snd) a_team1: [' +  item.a_score1 + '] ' + 'b_team1: [' + item.b_score1 + ']' + 'a_team2: [' + item.a_score2 + ']' + 'b_team2: [' + item.b_score2 + ']');
      io.emit('minigame-cheer-rcv', {name: item.name, cheer: item.cheer, a_score1: item.a_score1, b_score1: item.b_score1, a_score2: item.a_score2, b_score2: item.b_score2});
    }
  });
  socket.on('minigame1-start-snd', item => {
    io.emit('minigame1-start-rcv', item)
  });
  socket.on('minigame2-start-snd', item => {
    io.emit('minigame2-start-rcv', {});
  });
  socket.on('report-user-snd', item => {
    console.log('(report-user-snd) sended from ' + item.name + ': [ ' + item.cheer + ' ]');
      var UserList = mongoose.model('User');
      var report_num = 0;
      UserList.findOne({userName: item.name}, function(err, userInfo){
        if(err){
          console.log('(report-user-snd)failed to find: ' + item.name);
        }else{
          report_num = userInfo.report;
          UserList.findOneAndUpdate({userName: item.name}, {report: userInfo.report + 1}, function(err, userInfo){
            if(err){
              console.log('(report-user-snd)failed to update: ' + item.name);
            }else{
              io.emit('report-user-rcv', {name: item.name, report: userInfo.report + 1});
            }
          });
        }
      });
  });
  socket.on('minigame-true-start-snd', item => {
    io.emit('minigame-true-start-rcv', item);
  })
  socket.on('minigame-true-end-snd', item => {
    io.emit('minigame-true-end-rcv', item);
  })
});

httpServer.listen(8080);
nms.run();
