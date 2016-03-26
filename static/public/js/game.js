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
  document.getElementById("points").innerHTML = points;
  document.getElementById("gross").innerHTML = gross;
}

function updatePoints() {
    
  for (var i = 0; i < buildings.length; i++) {
    points += buildings[i].power * freq[i] * flip;
    gross += buildings[i].power * freq[i] * flip;
  }
  document.getElementById("points").innerHTML = points;
  document.getElementById("gross").innerHTML = gross;
}



function buyBuilding(idx, factor) {
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
  }
}

var demolitionNumber = consumables[0].numberOf,
    demolitionPrice = consumables[0].initial * Math.pow(consumables[0].scaleC, demolitionNumber),
    raidNumber = consumables[1].numberOf,
    raidPrice = consumables[1].initial * Math.pow(consumables[1].scaleC, raidNumber),
    doubleAgentNumber = consumables[2].numberOf,
    doubleAgentPrice = consumables[2].initial * Math.pow(consumables[2].scaleC, doubleAgentNumber);

function selectForDemolition(){
    if (ownedBuildings > 0 && points >= demolitionPrice){
        points -= demolitionPrice;
        ++demolitionNumber;
        document.getElementById("points").innerHTML = points;
        var buildingNo = Math.floor(1 +(Math.random() * (ownedBuildings-1)));
        console.log(buildingNo);
        for (var i = 0; i < freq.length; i++){
            buildingNo -= freq[i];
            if (buildingNo <= 0){
                destroyBuilding(i);
                break;
            }
        }
    }
}

function destroyBuilding(index){
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

function raid(factor){
    console.log(points);
    console.log(raidPrice);
    if (points >= raidPrice){
        points -= raidPrice;
        ++raidNumber;
        var difference =points * factor;
        points -= difference;
        gross -= difference;
        document.getElementById("points").innerHTML = points;
        document.getElementById("gross").innerHTML = gross;
    }
}

function doubleAgent(time){ 
    console.log(doubleAgentPrice);
    console.log(flip);
    if (points >= doubleAgentPrice){
        points -= doubleAgentPrice;
        ++doubleAgentNumber;
        flip = -flip;
        console.log(flip);
        window.setTimeout(function(){
        flip = -flip;
        console.log(flip);
        },time);        
    }
    console.log('done');
}

window.setInterval(function(){
  updatePoints();
}, 50);

var urlsplit = window.location.href.split('/');
var roomid = urlsplit[urlsplit.length - 1];

var pid;

var socket = io();
//socket.join(roomid);

function onDeleteRoom() {
  console.log('delete this room!');
};

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
  gross = parseInt(readCookie('score'));
  ogross = parseInt(readCookie('oscore'));
  update();
} else {
  socket.emit('request-pid', roomid);
}

socket.on('dangit', function() { window.location.href = '/';}); //do stuff

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
