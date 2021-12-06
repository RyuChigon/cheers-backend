const mongoose = require('../database');
const { socket_cors } = require('../cors');

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: socket_cors,
  'pingInterval': 2000, 
  'pingTimeout': 6000000,
});

io.on("connection", (socket) => {
  console.log("connection");
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
  socket.on('logout-snd', item => {
    console.log("(logout-snd)" + item.name);
    var userList = mongoose.model('User');
    userList.findOneAndDelete( {userName: item.name}, (err, userInfo) => {
      if (err) return res.json({ success: false, err });
    });

    io.emit('logout-rcv', item)
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

module.exports = httpServer;