var express = require('express'),
    router = express.Router(),
    path = require('path');

router.get('/:roomid', function(req, res) {
  var roomid = req.params.roomid;
  if (rooms[roomid]) { // room exists
    res.sendFile(path.join(__dirname + '/game.html'));
  } else {
    res.writeHead(500, {'content-type': 'text/plain'});
    res.end('Room does not exist!');
  }
});

module.exports = router;
