var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/', express.static('static/public'));

function makeid() {
    var possible = 
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var text = "";
    for (var i = 0; i < 7; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

var sockets = {};
var rooms = {};
io.on('connection', function(socket) {
  var id;
  do {
    id = makeid();
  } while(sockets[id]);

  console.log('user connected with id: ' + id);

  socket.on('make-room', function() {
    var roomid;
    do {
      roomid = makeid();
    } while(rooms[roomid]);
    console.log('room id is:' + roomid);
    socket.emit('made-room', roomid);
  });
  socket.on('score', function(score) {
    console.log(score);
    socket.broadcast.emit('score', score);
  });

  socket.on('disconnect', function() {
    sockets[socket] = undefined;
    delete sockets[socket];
    console.log('user disconnected with id: ' + id);
  });
});

server.listen(4200, function(){
  console.log('listening on *: 4200');
});
