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
}

function updatePoints() {
  for (var i = 0; i < buildings.length; i++) {
    points += buildings[i].power * freq[i];
    gross += buildings[i].power * freq[i];
  }
  document.getElementById("points").innerHTML = points;
  document.getElementById("gross").innerHTML = gross;
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
  console.log(points);
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

var urlsplit = window.location.href.split('/');
var roomid = urlsplit[urlsplit.length - 1];

var pid;

var socket = io();
//socket.join(roomid);

function onDeleteRoom() {
  console.log('delete this room!');
};

if (document.cookie && readCookie('roomid') == roomid) {
  pid = readCookie('pid');
  socket.emit('auth', {'pid': pid, 'roomid': roomid});
  gross = parseInt(readCookie('score'));
  ogross = parseInt(readCookie('oscore'));
  update();
}
else {
  socket.emit('request-pid', roomid);
}

socket.on('dangit', function(){window.location = '/';}); //do stuff

socket.on('authorized', function(){}); //do stuff

socket.on('score', function(oscore){
  ogross = oscore;
  update();
});

socket.on('pid', function(newpid) {
  pid = newpid;
  document.cookie = 'pid=' + newpid + ' ; roomid=' + roomid; //add to this
  document.cookie = 'roomid=' + roomid;
  document.cookie = 'score=' + gross;
  document.cookie = 'oscore=' + ogross;
});

window.setInterval(function() {
  socket.emit('score', {'score' : gross, 'roomid' : roomid});
}, 500);
window.setInterval(function() {
  document.cookie= 'score=' + gross;
  document.cookie="oscore=" + ogross;
}, 1000);
