var socket = io();

function onClick() {
  var win;
  if (document.getElementById('points').checked) {
    if (!validatePointLimit()) {
      return;
    }
    win = 'points';
  } else if (document.getElementById('time').checked) {
    if (!validateTimeLimit()) {
      return;
    }
    win = 'time';
  } else {
    alert("Please choose win condition.");
    return;
  }

  var n = parseFloat(document.getElementById('limit').value);
  socket.emit('make-room', {'win' : win, 'limit' : n});
};

socket.on('made-room', function(roomid) {
  window.location.href = '/game/' + roomid;
});

function validatePointLimit() {
  var text = document.getElementById('limit').value;
  if (isNaN(text)) {
    alert("The point limit must be between 100 and 1e20 inclusive.");
    return false;
  }
  var n = parseFloat(text);
  if (100 <= n && n <= 1000000000000000000000) {
    return true;
  } else {
    alert("The point limit must be between 100 and 1e20 inclusive.");
    return false;
  }
}

function isPositiveInteger(n) {
  return 0 === n % (!isNaN(parseFloat(n)) && 0 <= ~~n);
}

function validateTimeLimit() {
  var text = document.getElementById('limit').value;
  console.log(text);
  if (!isPositiveInteger(text)) {
    alert("The time limit must be an integer"
          + " between 10 and 3600 seconds inclusive.");
    return false;
  }
  var n = parseInt(text);
  console.log(n);
  if (10 <= n && n <= 3600) {
    return true;
  } else {
    alert("The time limit must be an integer"
          + " between 10 and 3600 seconds inclusive.");
    return false;
  }
}
