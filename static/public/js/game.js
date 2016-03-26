css = { 
  padding:        0, 
  margin:         0, 
  width:          '30%', 
  top:            '40%', 
  left:           '35%', 
  textAlign:      'center', 
  color:          '#000', 
  border:         '3px solid #f4511e', 
  backgroundColor:'#fff', 
  cursor:         'wait' 
};
$.blockUI({ message: '<h1>Waiting for opponent...</h1>', fadeOut: 0, css: css});

var buildings = [
  { name : "Hacker", base : 15, power: .1 },
  { name : "Grandma", base : 100, power: 1 },
  { name : "Farm", base : 1100, power: 8 },
  { name : "Mine", base : 12000, power: 47 },
  { name : "Factory", base : 130000, power: 260 },
  { name : "Bank", base : 1400000, power: 1400 },
  { name : "Temple", base : 20000000, power: 7800 },
  { name : "Wizard Tower", base : 330000000, power: 44000 },
  { name : "Shipment", base : 5100000000, power: 260000 },
  { name : "Alchemy Lab", base : 75000000000, power: 1600000 },
  { name : "Portal", base : 1000000000000, power: 10000000 },
  { name : "Time Machine", base : 14000000000000, power: 65000000 },
  { name : "Antimatter Condenser", base : 170000000000000, power: 430000000 },
  { name : "Prism", base : 2100000000000000, power: 2900000000}
];
var scale = 1.1;

var points = 0,
  gross = 0,
  ogross = 0,
  freq = [];
for (var i = 0; i < buildings.length; i++) {
  freq.push(0);
}

for (var i = 0; i < buildings.length; i++) {
  $("#buildings").find('tbody').append(
    $('<tr>').append(
      $('<td>')
        .attr('id', 'freq' + i.toString())
        .text('0')
    ).append(
      $('<td>').append(
        $('<button>')
          .attr('class', 'button')
          .attr('onClick', 'buyBuilding(' + i.toString() + ')')
          .text(buildings[i].name)
      )
    ).append(
      $('<td>')
        .attr('id', 'price' + i.toString())
        .text(buildings[i].base.toString())
    )
  );
}

function single() {
  ++points;
  ++gross;
  document.getElementById("points").innerHTML = points;
  document.getElementById("gross").innerHTML = gross;
  checkPointsWin();
}

function updatePoints() {
  for (var i = 0; i < buildings.length; i++) {
    points += buildings[i].power * freq[i];
    gross += buildings[i].power * freq[i];
  }
  document.getElementById("points").innerHTML = points;
  document.getElementById("gross").innerHTML = gross;
  checkPointsWin();
}

function buyBuilding(idx) {
  var name = buildings[idx].name,
    base = buildings[idx].base,
    num = freq[idx];
  var price = base * Math.pow(scale, num);
  if (price <= points) {
    ++freq[idx];
    points -= price;
    gross += price;
    document.getElementById("points").innerHTML = points;
    document.getElementById("freq" + idx.toString()).innerHTML = freq[idx];
    document.getElementById("price" + idx.toString()).innerHTML = price * scale;
  }
}

window.setInterval(function(){
  updatePoints();
}, 50);

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function update() {
  document.getElementById("gross").innerHTML = gross;
  document.getElementById("ogross").innerHTML = ogross;
}

//globals
var urlsplit = window.location.href.split('/'),
    roomid = urlsplit[urlsplit.length - 1],
    pid,
    win,
    limit,
    origlimit;

var socket = io();

if (document.cookie && readCookie('roomid') == roomid) {
  pid = readCookie('pid');
  socket.emit('auth', {'pid': pid, 'roomid': roomid});
  points = parseFloat(readCookie('points'));
  gross = parseFloat(readCookie('score'));
  ogross = parseFloat(readCookie('oscore'));
  win = readCookie('win');
  limit = parseFloat(readCookie('limit'));
  origlimit = limit;
  update();
} else {
  socket.emit('request-pid', roomid);
}

socket.on('dangit', function() { window.location.href = '/';}); //do stuff

socket.on('authorized', function(obj) {
  win = obj.win;
  document.cookie = 'win=' + win;
  document.getElementById("win").innerHTML = win;
  origlimit = obj.limit;
  if (win == 'points') {
    limit = obj.limit;
    document.cookie = 'limit=' + limit.toString();
  } else {
    if (readCookie('limit') != limit) {
      limit = origlimit;
    }
  }
  document.getElementById("limit").innerHTML = limit;
  if (obj.start) {
    $.unblockUI({ fadeOut: 0 });
  }
}); //do stuff

socket.on('score', function(obj) {
  ogross = obj.score;
  update();
  if (win == 'time') {
    var elap = obj.elap / 1000.0;
    limit = Math.ceil(origlimit - elap);
    document.getElementById("limit").innerHTML = limit;
  }
});

socket.on('pid', function(newpid) {
  pid = newpid;
  document.cookie = 'pid=' + newpid + ' ; roomid=' + roomid; //add to this
  document.cookie = 'roomid=' + roomid;
  document.cookie = 'score=' + gross;
  document.cookie = 'oscore=' + ogross;
  socket.emit('auth', {'pid': pid, 'roomid': roomid});
});

window.setInterval(function() {
  socket.emit('score', {'score' : gross, 'roomid' : roomid, 'pid' : pid});
}, 500);
window.setInterval(function() {
  document.cookie= 'points=' + points;
  document.cookie= 'score=' + gross;
  document.cookie="oscore=" + ogross;
}, 1000);

function checkPointsWin() {
  if (win == 'points') {
    if (points >= limit) {
      socket.emit('win', {'pid' : pid, 'roomid' : roomid});
    }
  }
}

socket.on('winner', function(winpid) {
  if (win == 'time') {
    limit = 0;
    document.getElementById("limit").innerHTML = 0;
  }
  if (pid == winpid) {
    alert('You won! Congratulations!');
  } else {
    alert('You lost. Your ancestors are ashamed of you...');
  }
  socket.disconnect();
});

socket.on('start', function() {
  var timer = 5;
  (function t_minus() {
    $.blockUI({ fadeIn: 0, fadeOut: 0, 
                message: '<h1>' + timer.toString() + '</h1>', css: css});
    --timer;
    if (timer >= 0) {
      setTimeout(function() {
        t_minus();
      }, 1000);
    } else {
      $.unblockUI({ fadeOut: 0 }); 
    }
  }());
});
