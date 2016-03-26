var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io').listen(server),
    path = require('path');

app.use('/', express.static('static/public'));

app.get('/game/:roomid', function(req, res) {
  var roomid = req.params.roomid;
  if (rooms[roomid]) { // room exists
    res.sendFile(path.join(__dirname + '/static/public/game.html'));
  } else {
    res.writeHead(500, {'content-type': 'text/plain'});
    res.end('Room does not exist!');
  }
});

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
  sockets[id] = 'present';

  console.log('user connected with id: ' + id);

  socket.on('make-room', function() {
    var roomid;
    do {
      roomid = makeid();
    } while(rooms[roomid]);
    rooms[roomid] = true;
    console.log('room id is:' + roomid);
    socket.emit('made-room', roomid);
  });
  socket.on('score', function(score) {
    console.log('user ' + id + ' has a score of ' + score);
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
