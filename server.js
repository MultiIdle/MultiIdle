var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io').listen(server),
    path = require('path');

// static content
app.use('/', express.static('static/public/css'));
app.use('/', express.static('static/public/html'));
app.use('/', express.static('static/public/js'));
app.use('/game', express.static('static/public/css'));
app.use('/game', express.static('static/public/html'));
app.use('/game', express.static('static/public/js'));

// handle rooms
app.get('/game/:roomid', function(req, res) {
  var roomid = req.params.roomid;
  if (rooms[roomid]) { // room exists
    res.sendFile(path.join(__dirname + '/static/public/html/game.html'));
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

var pids = {},
    sockets = {},
    rooms = {};
io.on('connection', function(socket) {
  var id;
  do {
    id = makeid();
  } while(sockets[id]);
  sockets[id] = 'present';

  console.log('user connected with id: ' + id);

  socket.on('make-room', function(winlimit) {
    var roomid;
    do {
      roomid = makeid();
    } while(rooms[roomid]);
    rooms[roomid] = { pids: [] , win: winlimit.win, 
                      limit: winlimit.limit, end: false};
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
		} else {
			console.log('dangit: room is full');
			socket.emit('dangit');
		}
	});
	
	socket.on('auth', function(welp) {
    var rid = welp.roomid, pid = welp.pid;
    console.log("authentication " + rid + " " + pid);
		if ((rooms[rid].pids.length > 0 && 
			rooms[rid].pids[0] == pid) ||
			(rooms[rid].pids.length > 1 && 
			rooms[rid].pids[1] == pid)) {
			socket.emit('authorized', 
        {win : rooms[rid].win, limit : rooms[rid].limit});
			socket.join(rid);
      if (io.sockets.adapter.rooms[rid].length == 2) { //two users in room
        io.to(rid).emit('start');
      }
		} else {
			console.log('dangit: cookie failure');
			console.log(rooms[rid]);
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
		socket.emit('pid');
		socket.emit('authorized');
	});

  socket.on('win', function(welp) {
    var rid = welp.roomid, pid = welp.pid;
    if (!rooms[rid].end) {
      rooms[rid].end = true;
      io.to(rid).emit('winner', pid);
    }
  });
	
  socket.on('disconnect', function() {
    sockets[socket] = undefined;
    delete sockets[socket];
    console.log('user disconnected with id: ' + id);
  });
});

server.listen(4200, function() {
  console.log('listening on *: 4200');
});

module.exports = app;
