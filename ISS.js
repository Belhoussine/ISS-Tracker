// Creating the map and setting the tiles and marker's attributes.
const mymap = L.map('ISSmap',{fullscreenControl: true});
const tileurl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution= '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
L.tileLayer(tileurl, {attribution}).addTo(mymap);
const ISSicon= L.icon({
  iconUrl: 'ISS.png',
  iconSize: [50,32],
  iconAnchor: [25, 16]
});
const marker = L.marker([0, 0],{icon:ISSicon});

// Getting the names of people currently aboard the ISS from API.
const url="https://api.wheretheiss.at/v1/satellites/25544";
let flag=true;
let init=[0,0];
const ppl= fetch ("http://api.open-notify.org/astros.json").then(response => response.json()).then(json => {
  const n= json.number;
  let names="";
  for(let i=0;i<n;i++ ){
    if(json.people[i].craft === "ISS")
    names+=json.people[i].name;
    names+="<br>";
  }
  document.getElementById("ppl").innerHTML=names;
});

// Getting ISS location from API and sketching it on the map then updating its position.
async function getISS(){
  const res= await fetch(url);
  const data= await res.json();
  const {latitude,longitude,altitude,velocity,visibility} = data;
  if(flag){
    init=[latitude,longitude];
    mymap.setView([latitude, longitude], 3);
    flag=false;
  }
  if(! flag){
    var line=L.polyline([init,[latitude,longitude]],{color: "red",weight:1,smoothFactor:2,lineCap:'round'}).addTo(mymap);
    init=[latitude,longitude];
  }
  var lat='51.503532';
  var long= '-2.127632';
  var apikey = 'd528d06715f54eec88966478830f672a';
  var api_url = 'https://api.opencagedata.com/geocode/v1/json'
  var request_url = api_url
  + '?'
  + 'key=' + apikey
  + '&q=' + encodeURIComponent(latitude + ',' + longitude)
  + '&pretty=1'
  + '&no_annotations=1';

  const loc= await fetch (request_url);
  const locData= await loc.json();
  const location=(locData.results[0]==null || locData.rate.remaining == 0)?"Loading..":locData.results[0].components;
  const {continent, country, county, state } = location;

  marker.setLatLng([latitude,longitude]);
  document.getElementById('lat').textContent = latitude.toFixed(4);
  document.getElementById('lon').textContent = longitude.toFixed(4);
  document.getElementById('alt').textContent = altitude.toFixed(1);
  document.getElementById('vel').textContent = velocity.toFixed(0);

  if(!(JSON.stringify(location) === '\"Loading..\"')){

    if(location._type=="body_of_water")
    document.getElementById('loc').textContent = locData.results[0].formatted;
    else
    document.getElementById('loc').textContent = county +", "+state+", "+country+", "+continent;
  }
  else {
    document.getElementById('loc').textContent = location;

  }
  marker.addTo(mymap);
}
function getTime(){
  // Getting IP of user to get the TimeZone and display time
  fetch('http://worldtimeapi.org/api/ip/').then(data => data.json()).then( data =>{
    var date=data.datetime.split("T")[0]
    var time=data.datetime.split("T")[1].split(".")[0]
    document.getElementById("time").innerHTML=date + " " +time;
  });
}
getISS();
setInterval(getISS,1500);
getTime();
setInterval(getTime,500)
