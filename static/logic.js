// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data.features)
});

function createFeatures(earthquakeData) {

// Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
//Create a function for setting radius size

  function radiusSize(magnitude) {
    return magnitude * 20000;
  }

//Create a function for setting Circle Color
  function circleColor(magnitude) {
    if (magnitude < 1) {
      return "#ff3333"
    }
    else if (magnitude < 2) {
      return "#ff6633"
    }
    else if (magnitude < 3) {
      return "#ff9933"
    }
    else if (magnitude < 4) {
      return "#ffcc33"
    }
    else if (magnitude < 5) {
      return "#ff0000"
    }
    else {
      return "#ff0000"
    }
  }
  
// Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 1
      });
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create a faultline layer
  var faultLine = new L.LayerGroup();

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Outdoor Map": outdoormap,
    "Greyscale Map": grayscalemap,
    "Satellite Map": satmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines: faultLine
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      39.8283, -98.5795
    ],
    zoom: 5,
    layers: [outdoormap, earthquakes, faultLine]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

   // Query to retrieve the faultline data
   var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  
   // Create the faultlines and add them to the faultline layer
   d3.json(faultlinequery, function(data) {
     L.geoJSON(data, {
       style: function() {
         return {color: "orange", fillOpacity: 0}
       }
     }).addTo(faultLine)
   })
 
// color function to be used when creating the legend
function getColor(d) {
     return d > 5 ? '#ff3333' :
            d > 4  ? '#ff6633' :
            d > 3  ? '#ff9933' :
            d > 2  ? '#ffcc33' :
            d > 1  ? '#ffff33' :
                     '#ccff33';
}

// Add legend to the map
var legend = L.control({position: 'bottomright'});
  
// Details for the legend
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");

  var grades = [0, 1, 2, 3, 4, 5];
  var colors = [
  ];

  // Looping through
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      "<i style='background: " + getColor(colors[i] +1) + "'></i> " +
      grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
  }
  return div;
};

legend.addTo(myMap);
}

/// Initial Attempt /////
// function createMap(seismicStations) {

//     // Create the tile layer that will be the background of our map
//     var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
//       attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
//       maxZoom: 18,
//       id: "mapbox.light",
//       accessToken: API_KEY
//     });
  
//     // Create a baseMaps object to hold the lightmap layer
//     var baseMaps = {
//       "Light Map": lightmap
//     };
  
//     // Create an overlayMaps object to hold the seismicStations layer
//     var overlayMaps = {
//       "Seismic Stations": seismicStations
//     };
  
//     // Create the map object with options
//     var map = L.map("map", {
//       center: [39.8283, -98.5795],
//       zoom: 10,
//       layers: [lightmap, seismicStations]
//     });
  
//     // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
//     L.control.layers(baseMaps, overlayMaps, {
//       collapsed: false
//     }).addTo(map);
//   }
  
//   function createMarkers(response) {
  
//     // Pull the "id" property off of response.data
//     var stations = response.features.geometry;
  
//     // Initialize an array to hold bike markers
//     var stationMarkers = [];
  
//     // Loop through the stations array
//     for (var index = 0; index < stations.length; index++) {
//       var station = stations[index];
  
//       // For each station, create a marker and bind a popup with the station's name
//       var stationMarkers = L.marker([station.lat, station.lon])
//         .bindPopup("<h3>" + station.name + "<h3><h3>Capacity: " + station.capacity + "<h3>");
  
//       // Add the marker to the bikeMarkers array
//       stationMarkers.push(stationMarkers);
//     }
  
//     // Create a layer group made from the bike markers array, pass it into the createMap function
//     createMap(L.layerGroup(seismicMarkers));
//   }
  
  
//   // Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
//   d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", createMarkers);
  