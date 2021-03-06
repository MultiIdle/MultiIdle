css = { 
  padding:        0, 
  margin:         0, 
  width:          '30%',
  height:         '25%',  
  top:            '40%', 
  left:           '35%', 
  textAlign:      'center',
  color:          '#000', 
  border:         '3px solid #f4511e',
  backgroundColor:'#fff', 
  cursor:         'wait' 
};
$.blockUI({ message: '<h1>Waiting for opponent...</h1><textarea id="link" style="font-size:18px">'+window.location.href+'</textarea>', fadeOut: 0, css: css});
var socket = io();

var buildings = [
  { name : "Iron", base : 15, power: .1 },
  { name : "Big Iron", base : 100, power: 1 },
  { name : "Oh, the Irony", base : 1100, power: 8 },
  { name : "Mine", base : 12000, power: 47 },
  { name : "Factory", base : 130000, power: 260 },
  { name : "Bank", base : 1400000, power: 1400 },
  { name : "Temple", base : 20000000, power: 7800 },
  { name : "Pickle Factory", base : 330000000, power: 44000 },
  { name : "The WALL", base : 5100000000, power: 260000 },
  { name : "Munitions Depot", base : 75000000000, power: 1600000 },
  { name : "Kyoto Animation", base : 1000000000000, power: 10000000 },
  { name : "Quaternion Distillery", base : 14000000000000, power: 65000000 },
  { name : "Big Black Hole", base : 170000000000000, power: 430000000 },
  { name : "Grassy Magnetic Field Reversal^2", base : 2100000000000000, power: 2900000000}
];

var consumables = [
    {name : "Demolition", initial: 10, scaleC: 5, numberOf: 0 },
    {name : "Raid", initial: 100, scaleC: 10, numberOf: 0},
    {name : "Double Agent", initial: 1000, scaleC: 2, numberOf: 0}
]

var points = 0,
    pps = 0,
    gross = 0,
    freq = [],
    ownedBuildings = 0,
    scale = 1.1,
    flip = 1;

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
          .attr('onClick', 'buyBuilding(' + i.toString() +', 1)')
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
  document.getElementById("points").innerHTML = Math.round(points);
  document.getElementById("gross").innerHTML = Math.round(gross);
  checkPointsWin();
}

function updatePoints() {
    
  for (var i = 0; i < buildings.length; i++) {
    points += buildings[i].power * freq[i] * flip;
    gross += buildings[i].power * freq[i] * flip;
  }
  document.getElementById("points").innerHTML = points;
  document.getElementById("gross").innerHTML = gross;
  document.getElementById("points").innerHTML = Math.round(points);
  document.getElementById("gross").innerHTML = Math.round(gross);
  checkPointsWin();
}

function buyBuilding(idx, factor) {
    var pics = ['/iron.png', '/fire.png', '/scarybush.png', '/gun.png', 'iron.png', 'big-iron.png', 'nic-cage.png'];
    var name = buildings[idx].name,
    base = buildings[idx].base,
    num = freq[idx];
    
  var price = base * Math.pow(scale, num);
  if (price * factor <= points) {
    ownedBuildings += factor;
    freq[idx] += factor;
    pps += buildings[idx].power * 20;
    points -= price;
    gross += price;
    document.getElementById("points").innerHTML = points;
    document.getElementById("freq" + idx.toString()).innerHTML = freq[idx];
    document.getElementById("price" + idx.toString()).innerHTML = price * scale;
    document.getElementById("pps").innerHTML = pps;
    var x = document.createElement("img");
		x.src = pics[idx];
		x.style = "position: absolute; bottom: 10";
		document.body.appendChild(x);  
    $("img").animate({left: '120%'}, {duration: 15000});
    document.getElementById("price" + idx.toString()).innerHTML = Math.round(price * scale);
  }
}
    
var demolitionNumber = consumables[0].numberOf,
    demolitionPrice = consumables[0].initial * Math.pow(consumables[0].scaleC, demolitionNumber),
    raidNumber = consumables[1].numberOf,
    raidPrice = consumables[1].initial * Math.pow(consumables[1].scaleC, raidNumber),
    doubleAgentNumber = consumables[2].numberOf,
    doubleAgentPrice = consumables[2].initial * Math.pow(consumables[2].scaleC, doubleAgentNumber);

function selectForDemolition() {
  socket.emit('demolish');
}

socket.on('demolish', function() {
  if (ownedBuildings > 0 && points >= demolitionPrice){
    points -= demolitionPrice;
    ++demolitionNumber;
    demolitionPrice = consumables[0].initial * Math.pow(consumables[0].scaleC, demolitionNumber);
    document.getElementById("points").innerHTML = points;
    var buildingNo = Math.floor(1 +(Math.random() * (ownedBuildings-1)));
    console.log(buildingNo);
    for (var i = 0; i < freq.length; i++) {
      buildingNo -= freq[i];
      if (buildingNo <= 0){
        destroyBuilding(i);
        break;
      }
    }
  }
});

function destroyBuilding(index) {
  base = buildings[index].base;
  num = freq[index];
  var price = base * Math.pow(scale, num);
  pps -= buildings[index].power * 20;
  --freq[index];
  --ownedBuildings;
  document.getElementById("freq" + index.toString()).innerHTML = freq[index];
  document.getElementById("price" + index.toString()).innerHTML = price / scale;
  document.getElementById("pps").innerHTML = pps;
}

function raid(factor) {
  if (points >= raidPrice) {
    socket.emit('raid', factor);
    points -= raidPrice;
    ++raidNumber;
    raidPrice = consumables[1].initial 
        * Math.pow(consumables[1].scaleC, raidNumber);
  }
}

socket.on('raid', function(factor) {
  var difference = points * factor;
  points -= difference;
  gross -= difference;
  document.getElementById("points").innerHTML = points;
  document.getElementById("gross").innerHTML = gross;
});

function doubleAgent(time) {
  if (points >= doubleAgentPrice) {
    socket.emit('doubleAgent', time);
    points -= doubleAgentPrice;
    ++doubleAgentNumber;
    doubleAgentPrice = consumables[2].initial 
      * Math.pow(consumables[2].scaleC, doubleAgentNumber);     
  }
  console.log('done');
}

socket.on('doubleAgent', function(time) {
  flip = -flip;
  console.log(flip);
  window.setTimeout(function() {
    flip = -flip;
    console.log(flip);
  }, time); 
});

window.setInterval(function(){
  updatePoints();
}, 50);

var urlsplit = window.location.href.split('/');
var roomid = urlsplit[urlsplit.length - 1];

var pid;
function update() {
  document.getElementById("gross").innerHTML = Math.round(gross);
  document.getElementById("ogross").innerHTML = Math.round(ogross);
}

//globals
var urlsplit = window.location.href.split('/'),
    roomid = urlsplit[urlsplit.length - 1],
    pid,
    win,
    limit,
    origlimit;

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
