var myMap = L.map("map", {
    center: [45, -100],
    zoom: 3
  });

L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
maxZoom: 18,
id: "mapbox.streets",
accessToken: API_KEY
}).addTo(myMap);


function createCircles(response) {
    var earthquakes = response.features

    function getColor(mag) {
      if (mag<1) {color = "#adff2f"}
        else if (mag>1 && mag<2) {color = "#f9ce06"}
        else if (mag>2 && mag<3) {color = "#ffab00"}
        else if (mag>3 && mag<4) {color = "#ff8800"}
        else if (mag>4 && mag<52) {color = "#ff5e00"}
        else {color = "#ff0000"}
      return color
    }

    for (var i = 0; i<earthquakes.length; i++) {
        var earthquake = earthquakes[i]
        var coordinates = earthquake.geometry.coordinates
        var properties = earthquake.properties
        var mag = earthquake.properties.mag

        var color = getColor(mag)
        var radius = 3
        L.circle([coordinates[1], coordinates[0]], {
            fillOpacity: 0.75,

            color: color,
            radius: mag *20000
        }).bindPopup("<h1>"+properties.place
        +"</h1><hr><h3>Time: "+properties.time
        +"</h3><hr><h3>Magnitude: "+properties.mag
        // +"</h3><hr><h3>Url: "+properties.url
        ).addTo(myMap)
    }

    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var magnitude = [0, 1, 2, 3, 4, 5];
      var colors = ["#adff2f", "#f9ce06", "#ffab00", "#ff8800", "#ff5e00", "#ff0000"]
      var labels = [];

      var legendInfo = "<h2> Magnitude</h2>"
      div.innerHTML = legendInfo
      for (var i=0; i<magnitude.length; i++) {
        div.innerHTML +=
          // '<i style="background:' + getColor(magnitude[i] +1) + '"></i>' +
          '<i style="background:' + colors[i] + '"></i>' +
          magnitude[i] + (magnitude[i+1] ? '&ndash;' + magnitude[i+1] + '<br>' : '+')
      }

      return div;
    };
  
    // Adding legend to the map
    legend.addTo(myMap);
}


var url="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
d3.json(url,createCircles)
