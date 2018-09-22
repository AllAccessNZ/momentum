var map,
  infoWindow,
  markers = [],
  readyToAddMarker = false,
  dirService,
  dirRenderer,
  contentString = "",
  myLocation,
  autocomplete,
  request,
  markerLocation;

function initMap() {
  // The map, centered at Uluru
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: { lat: 48.1252, lng: 11.5407 }
  });

  autocomplete = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */ (document.getElementById("autocomplete")),
    { types: ["geocode"] }
  );

  map.setCenter(returnUserLocation());

  // THe info window content
  contentString =
    '<div id="content">' +
    '<div id="siteNotice">' +
    "</div>" +
    '<h1 id="firstHeading" class="firstHeading">Uluru</h1>' +
    '<div id="bodyContent">' +
    "<textarea><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large " +
    "sandstone rock formation in the southern part of the " +
    "Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) " +
    "south west of the nearest large town, Alice Springs; 450&#160;km " +
    "(280&#160;mi) by road. Kata Tjuta and Uluru are the two major " +
    "features of the Uluru - Kata Tjuta National Park. Uluru is " +
    "sacred to the Pitjantjatjara and Yankunytjatjara, the " +
    "Aboriginal people of the area. It has many springs, waterholes, " +
    "rock caves and ancient paintings. Uluru is listed as a World " +
    "Heritage Site.</textarea>" +
    '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
    "https://en.wikipedia.org/w/index.php?title=Uluru</a> " +
    "(last visited June 22, 2009).</p>" +
    "</div>" +
    "</div>";

  //The info window
  infoWindow = new google.maps.InfoWindow({ content: contentString });

  dirService = new google.maps.DirectionsService();
  var dirRenderer = new google.maps.DirectionsRenderer({
    draggable: true,
    suppressMarkers: true
  });

  dirRenderer.setMap(map);
  placeDBMarkerOnMap();

  request = {
    origin: "-36.850955, 174.757425",
    destination: "-36.854612, 174.745891",
    travelMode: google.maps.TravelMode.WALKING,
    provideRouteAlternatives: true
  };

  bindEvents();
}

function bindEvents() {
  autocomplete.addListener("place_changed", fillInAddress);

  $("#autocomplete").focus(geolocate());

  //Add event handler to a map click
  map.addListener("click", event => {
    if (readyToAddMarker) {
      handleMapClick(event);
    } else {
    }
    infoWindow.close();
  });

  $("#addMarkerButton").click(function() {
    readyToAddMarker = true;
  });
}

function checkMarkersNearRoute(polyLine) {
  var checkMarkers = false;
  markers.forEach(marker => {
    var latLng = new google.maps.LatLng(
      marker.position.lat(),
      marker.position.lng()
    );
    if (google.maps.geometry.poly.isLocationOnEdge(latLng, polyLine, 0.001)) {
      checkMarkers = true;
    }
  });
  return checkMarkers;
}

function placeDBMarkerOnMap() {
  $.get("http://localhost/Wheels/api/marker/read.php", function(data) {
    if (data.message === "No markers found.") {
      console.log(data);
    } else {
      data.records.forEach(object => {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(object.lat, object.lng),
          map: map
        });

        marker.addListener("click", function() {
          infoWindow.open(map, marker);
        });

        markers.push(marker);
        console.log(markers);
      });
    }

    dirService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        var x = 0,
          shortestAllowedRouteIndex = 0,
          shortestAloowedRouteDistance = 0;

        for (x; x < result.routes.length; x++) {
          var distance = 0,
            path;

          distance = result.routes[x].legs[0].distance.value;

          path = result.routes[x].overview_path;

          var polyLine = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2
          });

          //Make sure one distance is selected
          if (shortestAloowedRouteDistance == 0) {
            shortestAloowedRouteDistance = distance;
          }

          //Check if any icons close to polyline
          if (checkMarkersNearRoute(polyLine)) {
            console.log("Route one too close to icon");
          } else {
            console.log("Route is okay");
            //Check if new route has the lowest distance
            if (shortestAloowedRouteDistance > distance) {
              shortestAloowedRouteDistance = distance;
              shortestAllowedRouteIndex = x;
            }
          }
        }

        new google.maps.DirectionsRenderer({
          map: map,
          directions: result,
          routeIndex: shortestAllowedRouteIndex
        });
      }
    });
  });
}

function handleMapClick(event) {
  placeMarker(event.latLng);
}

function placeMarker(location) {
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });

  marker.addListener("click", function() {
    infoWindow.open(map, marker);
  });

  contentString =
    '<div id="newMarkerForm">' +
    '<input id="nameInput" placeholder="Name" type="text"></input>' +
    '<input id="description" placeholder="Desciption" type="text"></input>' +
    "<span>Catergory</span>" +
    '<select name="catergories">' +
    '<option value="1">1</option>' +
    '<option value="2">2</option>' +
    '<option value="3">3</option>' +
    '<option value="4">4</option>' +
    "</select>" +
    "<button id='addinfobutton' onClick='submitForm()'>Add Marker</button>" +
    "</div>";

  var infoWindow = new google.maps.InfoWindow({
    content: contentString
  });

  map.setCenter(location);

  infoWindow.open(map, marker);

  markers.push(marker);

  markerLocation = location;
}

function saveNewMarkerToDB(dynamicData) {
  // submit form data to api
  $.ajax({
    url: "http://localhost/Wheels/api/marker/create.php",
    type: "POST",
    contentType: "application/json",
    data: dynamicData,
    success: function(result) {
      // product was created, go back to products list
      console.log("added successfully");
    },
    error: function(xhr, resp, text) {
      // show error to console
      console.log(xhr, resp, text);
    }
  });
}
//Return a position with client info
function returnUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      return pos;
    });
  }
}

function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}

function fillInAddress() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();
  console.log(place);
  placeMarker(place.geometry.location);
  map.setCenter();

  document.getElementById("autocomplete").value = "";
  // document.getElementById(component).disabled = false;

  // Get each component of the address from the place details
  // and fill the corresponding field on the form.
}

function submitForm() {
  var dynamicData = {};
  ////////////PLACEHOLDER VALUES TILL WE PROMPT USER INPUT////////////
  dynamicData["user_id"] = 1;
  dynamicData["name"] = "Test Name";
  dynamicData["address"] = "Test Address";
  dynamicData["description"] = "Test Description";
  dynamicData["type"] = "Test Type";
  dynamicData["lat"] = markerLocation.lat();
  dynamicData["lng"] = markerLocation.lng();
  infoWindow.close();
  saveNewMarkerToDB(JSON.stringify(dynamicData));
  readyToAddMarker = false;
}
