var buildings = [
  { name : "Hacker", base : power: .1 },
  { name : "Grandma", base :  power: 1 },
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

var points = 0,
  gross = 0;
  freq = [];
for (var i = 0; i < buildings.length; i++) {
  freq.push(0);
}

for (var i = 0; i < buildings.length; i++) {
  $("#buildings").find('tbody')
    .append($('<tr>')
      .append($('<button>')
        .attr('class', 'button')
        .attr('onClick', 'buyBuilding(' + i.toString() + ')')
          .text("Buy " + buildings[i].name + "!")
        )
      );
}

function single() {
  ++points;
  ++gross;
  document.getElementById("counter").innerHTML = points;
  document.getElementById("gCount").innerHTML = gross;
}

function updatePoints() {
  for (var i = 0; i < buildings.length; i++) {
    points += buildings[i].power * freq[i];
  }
  document.getElementById("counter").innerHTML = points;
  document.getElementById("gCount").innerHTML = gross;
}

function buyBuilding(idx) {
  var name = buildings[idx].name,
    base = buildings[idx].base,
    scale = buildings[idx].scale,
    num = freq[idx];
  var price = base * Math.pow(scale, num);
  if (price <= points) {
    ++freq[idx];
    points -= price;
    gross += price;
    document.getElementById("counter").innerHTML = points;
    document.getElementById(name + "Count").innerHTML = freq[idx];
  }
}

window.setInterval(function(){
  updatePoints()
  console.log(points);
}, 1000);
