const express = require('express');
const router = express.Router();
const { router_cors } = require('../cors');
const mongoose = require('../database');
const fs = require('fs');
const ffmpeg = require('ffmpeg');
const { User } = require("../models/user");
const { Score } = require("../models/score");

router.use(router_cors);

router.post("/register", async(req, res) => {
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

router.post("/modifyuser", async(req, res) => {
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

router.get("/users", async(req, res) => {
  res.set('Access-Control-Allow-Credentials', 'true');
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  const users = await User.find({});
  res.json(users);
});

let numOfCheers = 0;
let numOfViewpoints = 0;
let viewpoints = [];
const CHEERING_STANDARD = 10;

initializeCheers = setInterval(function() {
  numOfCheers = 0;
}, 20000)

router.get("/cheering", (req, res) => {
  numOfCheers++;
  if (numOfCheers >= CHEERING_STANDARD) {
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
      const set_twoDigit = (time) => {
        return time < 10 ? '0' + time : time;
      }
      const viewpoints_format = {
        num: numOfViewpoints,
        hour: set_twoDigit(parseInt(archiveTime / 3600)),
        min: set_twoDigit(parseInt((archiveTime % 3600) / 60)),
        sec: set_twoDigit(archiveTime % 60)
      }
      const targetVideo = path + fileName;
      const archivedPath = `../cheers-frontend/src/components/ViewPoint/archive/`
      const archivedVideo = archivedPath + `archived${numOfViewpoints}.mp4`;

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
                    file_name: `thumbnail${numOfViewpoints}`
                  };
                  video.fnExtractFrameToJPG(archivedPath, img_option, (err, file) => {
                    if (!err) {
                      console.log('thumbnail complete!');
                      setTimeout(() => {
                        viewpoints.push(viewpoints_format);
                        numOfViewpoints++;
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
});

router.get("/viewpoints", (req, res) => {
  res.set('Access-Control-Allow-Credentials', 'true');
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.json({ viewpoints: viewpoints });
});

module.exports = router;