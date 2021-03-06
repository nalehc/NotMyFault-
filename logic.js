// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup("<p><strong>Earthquake Detected! </strong>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "</p><p>Magnitude: " + feature.properties.mag + "</p>");
  }


  function markerSize(mag) {
    return (mag * 3);
  }

  function getColor(mag) {
    var color;
    var r = Math.floor(15 + 59 * mag);
    var g = Math.floor(255 - 18 * mag);
    var b = Math.floor(255 - 36 * mag);
    color = "rgb(" + r + " ," + g + "," + b + ")"
    return color
  }

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function(feature, latlng) {
      var geojsonMarkerOptions = {
        radius: markerSize(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        color: "#e5f7b0",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });

  var faultUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_steps.json"

  d3.json(faultUrl, function(data) {
    createFaults(data.features);
  });

  function createFaults(faultData) {
    var faultLines = L.geoJson(faultData, {
      style: function(feature) {
        return {
          color: "#999",
          weight: 1,
          fillOpacity: 0.1
        };
      }
    });

    createMap(earthquakes, faultLines);

  }
}

function createMap(earthquakes, faultLines) {

  function getColor(mag) {
    var color;
    var r = Math.floor(15 + 59 * mag);
    var g = Math.floor(255 - 18 * mag);
    var b = Math.floor(255 - 36 * mag);
    color = "rgb(" + r + " ," + g + "," + b + ")"
    return color
  }

  var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiY2hlbGFuIiwiYSI6ImNqZHdoamV5ODAzemYzMG52a2N6bThzcDMifQ.NQZ4hcJvfZG8k66KYptrug");

  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiY2hlbGFuIiwiYSI6ImNqZHdoamV5ODAzemYzMG52a2N6bThzcDMifQ.NQZ4hcJvfZG8k66KYptrug");

  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [darkMap, earthquakes]
  });

  var baseMaps = {
    "Dark Map": darkMap,
    "Light Map": lightMap
  };

  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": faultLines
  };
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);

  var sliderControl = L.control.sliderControl({
    position: "bottomleft", 
    layer: earthquakes, 
    timeAttribute: "epoch",
    isEpoch: true,
    range: true
  });
  myMap.addControl(sliderControl);
  sliderControl.startSlider();
  // $('#slider-timestamp').html(options.markers[ui.value].feature.properties.time.substr(0, 19));


  // add legend
  var legend = L.control({
    position: 'bottomright'
  });

  legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend'),
      grades = [1, 2, 3, 4, 5, 6];
    div.innerHTML = '<h3>Quake Magnitude</h3>'

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i]) + '; color:' + getColor(grades[i]) + ';">....</i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div
  };


  legend.addTo(myMap);


}