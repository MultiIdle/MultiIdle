var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io').listen(server),
    path = require('path');

app.use('/', express.static('static/public'));

app.use('/game', express.static('static/public'));

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

var pids = {};
sockets = {};
rooms = {};
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
    rooms[roomid] = { pids: [] };
    console.log('room id is:' + roomid);
    socket.emit('made-room', roomid);
  });
  socket.on('score', function(welp) {
    //console.log('user ' + id + ' has a score of ' + welp.score);
    socket.broadcast.to(welp.roomid).emit('score', welp.score);
  });
	
	socket.on('request-pid', function(roomid) {
		if (rooms[roomid].pids.length < 2) {
			var pid;
			do {
				pid = makeid();
			} while(pids[pid]);
			pids[pid] = true;
			socket.emit('pid', pid);
			rooms[roomid].pids.push(pid);
			console.log(pid + ' has joined room ' + roomid);
			socket.join(roomid);
		}
		else {
			console.log('dangit: room is full');
			socket.emit('dangit');
		}
	});
	
	socket.on('auth', function(welp) {
		if ((rooms[welp.roomid].pids.length > 0 && 
			rooms[welp.roomid].pids[0] == welp.pid) ||
			(rooms[welp.roomid].pids.length > 1 && 
			rooms[welp.roomid].pids[1] == welp.pid)) {
			socket.emit('authorized');
			socket.join(welp.roomid);
			}
		else {
			console.log('dangit: cookie failure');
			console.log(rooms[welp.roomid]);
			console.log(welp);
			socket.emit('dangit');
		}
	});
	
	socket.on('new-pid', function() {
		var pid;
		do {
			pid = makeid();
		} while(pids[pid]);
		pids[pid] = true;
		socket.emit('pid', pid);
		socket.emit('authorized');
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

module.exports = app;
