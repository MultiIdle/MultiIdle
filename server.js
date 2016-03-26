var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/', express.static('static/public'));

server.listen(4200, function(){
  console.log('listening on *: 4200');
});
