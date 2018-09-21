var map, infoWindow;

var mapModule = function() {};

function initMap() {
  // The location of Uluru (TEST LOCATION)
  var uluru = { lat: -25.344, lng: 131.036 };

  // The map, centered at Uluru
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: uluru
  });

  //The info window
  infoWindow = new google.maps.InfoWindow();

  //Place all markers on the 
  function placeDBMarkerOnMap() {
    $.get("http://localhost/MapOnWheels/api/marker/read.php", function(data) {
      data.records.forEach(object => {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(object.lat, object.lng),
          map: map
        });
      });
    });
  }

  // The marker, positioned at Uluru (THE TEST LOCATION)
  var marker = new google.maps.Marker({ position: uluru, map: map });

  placeDBMarkerOnMap();

  //Add event handler to a map click
  map.addListener("click", event => handleMapClick(event));

  //Handle a map click event
  function handleMapClick(event) {
    console.log("Handlemapclicked");
    placeMarker(event.latLng);
  }

  //Takes a location of latLng as input. Place a marker at that location
  function placeMarker(location) {
    var dynamicData = {};
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });

    console.log(location);
    console.log(location.lat);

    ////////////PLACEHOLDER VALUES TILL WE PROMPT USER INPUT////////////
    dynamicData["user_id"] = 1;
    dynamicData["name"] = "Test Name";
    dynamicData["address"] = "Test Address";
    dynamicData["description"] = "Test Description";
    dynamicData["type"] = "Test Type";
    dynamicData["lat"] = location.lat();
    dynamicData["lng"] = location.lng();

    saveNewMarker(JSON.stringify(dynamicData));
  }

  //Take json coded marker data and attempts to save in database
  function saveNewMarker(dynamicData) {
    // submit form data to api
    $.ajax({
      url: "http://localhost/MapOnWheels/api/marker/create.php",
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

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        infoWindow.setPosition(pos);
        infoWindow.setContent("Location found.");
        infoWindow.open(map);
        map.setCenter(pos);
      },
      function() {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}
