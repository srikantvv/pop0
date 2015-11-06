$(document).ready(function() {

  // This code could be used to set active (selected) navigation elements but it is kind of a hack.
  // $('.nav [href="'+ window.location.pathname +'"]').closest('li').toggleClass('active');
  // *Instead* we set the active menu item in the jade template via passing in the URL.

  // To handle facebook URL junk:
  // http://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url
  console.log("Reached main.js");

  var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var csv = '';
var sep = ";";
var lsep = "\n";
var flag = 0;
var markersArray = [];
var polyArray = [];

function initialize() {
  directionsDisplay1 = new google.maps.DirectionsRenderer();
  directionsDisplay2 = new google.maps.DirectionsRenderer();
  directionsDisplay3 = new google.maps.DirectionsRenderer();
  var chicago = new google.maps.LatLng(22, 83);
  var mapOptions1 = {
    zoom:5,
    center: chicago
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions1);
  directionsDisplay1.setMap(map)

  var control = document.getElementById('control');
  control.style.display = 'block';
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
}

var generateUid = function (separator) {
    /// <summary>
    ///    Creates a unique id for identification purposes.
    /// </summary>
    /// <param name="separator" type="String" optional="true">
    /// The optional separator for grouping the generated segmants: default "-".    
    /// </param>

    var delim = separator || "-";

    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (S4() + S4() + S4() + S4() + S4() + S4());
};

function addStep(startLat, startLng, midLatLng, endLat, endLng, encodeString, stepDis, headsign, isRel, roadID) {
	console.log(midLatLng);
	var newStep = {
		start_lat : parseFloat(startLat),
		start_lng : parseFloat(startLng),
		end_lat : endLat,
		end_lng : endLng,
		enc_path : encodeString,
		mid_path : midLatLng,
		distance : stepDis,
		headsign : headsign,
		is_rel : isRel,
		road_id : roadID
	}

	$.ajax({
	    type: 'POST',
	    data: newStep,
	    url: '/addstep',
	    dataType: 'JSON'
	}).done(function( data ) {
		$.each(data, function(){

		});
	});
}

function addRoad(startLat, startLng, endLat, endLng, encodeString, stepDis, headsign, genRoadID) {
	var newRoad = {
		"_id" : genRoadID,
		"start_lat" : startLat,
		"start_lng" : startLng,
		"end_lat" : endLat,
		"end_lng" : endLng,
		"enc_path" : encodeString,
		"distance": stepDis,
		"checked" : 0,
		"headsign" : headsign
	}
	$.ajax({
	    type: 'POST',
	    data: newRoad,
	    url: '/addroad',
	    dataType: 'JSON'
	}).done(function( data ) {
		$.each(data, function(){
		});
	});
}

function addRel(startLat, startLng, endLat, endLng, encodeString, stepDis, headsign, genRelID) {
	var newRel = {
		"_id" : genRelID,
		"start_lat" : startLat,
		"start_lng" : startLng,
		"end_lat" : endLat,
		"end_lng" : endLng,
		"enc_path" : encodeString,
		"distance": stepDis,
		"checked" : 0,
		"headsign" : headsign
	}
	$.ajax({
	    type: 'POST',
	    data: newRel,
	    url: '/addrel',
	    dataType: 'JSON'
	}).done(function( data ) {
		$.each(data, function(){
		});
	});
}

	

function addEntry(startLat, startLng, midLatLng, endLat, endLng, encodeString, stepDis, headsign, errFlag, roadID, isRel)
{
	if (errFlag == 0) {
		if(roadID) {
			addStep(startLat, startLng, midLatLng, endLat, endLng, encodeString, stepDis, headsign, isRel, roadID);
		} else if(stepDis < 100000) {
			genRoadID = generateUid();
			isRel = 0;
			addRoad(startLat, startLng, endLat, endLng, encodeString, stepDis, headsign, genRoadID)
			addStep(startLat, startLng, midLatLng, endLat, endLng, encodeString, stepDis, headsign, isRel, genRoadID);
		} else {
			genRelID = generateUid();
			isRel = 1;
			addRel(startLat, startLng, endLat, endLng, encodeString, stepDis, headsign, genRelID);
			addStep(startLat, startLng, midLatLng, endLat, endLng, encodeString, stepDis, headsign, isRel, genRelID);
		}
	}
}

function solveEntry(startLat, startLng, midLatLng, endLat, endLng, encodeString, stepDis) {

	var dy = endLat - startLat;
	var dx = endLng - startLng;
	var headsign = 0;

	if ( dx > 0 && dy >= 0 ) {
		headsign = 1;
	} else if ( dx <= 0 && dy > 0 ) {
		headsign = 2;
	} else if ( dx < 0 && dy <= 0 ) {
		headsign = 3;
	} else if ( dx >= 0 && dy < 0 ) {
		headsign = 4;
	}
	var disUpperLimit = 100;
	var disLowerLimit = 10;
	var deltaUpper = 0.2;
	var deltaLower = 0.05;
	var stepKm = stepDis/1000;
	var slope = (deltaUpper - deltaLower)/(disUpperLimit - disLowerLimit);
	var llDelta = (slope * (stepKm - disLowerLimit)) + deltaLower;
	if (stepDis > 100000)
		llDelta = deltaUpper;
	var startLatMin = startLat - llDelta;
	var startLatMax = startLat + llDelta;
	var startLngMin = startLng - llDelta;
	var startLngMax = startLng + llDelta;
	
	var endLatMin = endLat - llDelta;
	var endLatMax = endLat + llDelta;
	var endLngMin = endLng - llDelta;
	var endLngMax = endLng + llDelta;

	var startLatLngMin = new google.maps.LatLng(startLatMin,startLngMin);
	var startLatLngMax = new google.maps.LatLng(startLatMax,startLngMax);
	var endLatLngMin = new google.maps.LatLng(endLatMin,endLngMin);
	var endLatLngMax = new google.maps.LatLng(endLatMax,endLngMax);
	var startLatMinS = startLatLngMin.lat();
	var startLngMinS = startLatLngMin.lng();
	var startLatMaxS = startLatLngMax.lat();
	var startLngMaxS = startLatLngMax.lng();
	var endLatMinS = endLatLngMin.lat();
	var endLngMinS = endLatLngMin.lng();
	var endLatMaxS = endLatLngMax.lat();
	var endLngMaxS = endLatLngMax.lng();

	var roadID = 0;
	var errFlag = 0;
	var isRel = 0;
	var encPath = 0;
     	var defectPanel = document.getElementById('directions-panel');
	// If it is, compile all user info into one object
	var searchStep = {
		"start_lat_min" : startLatMinS,
		"start_lng_min" : startLngMinS,
		"start_lat_max" : startLatMaxS,
		"start_lng_max" : startLngMaxS,
		"end_lat_min" : endLatMinS,
		"end_lng_min" : endLngMinS,
		"end_lat_max" : endLatMaxS,
		"end_lng_max" : endLngMaxS,
		"start_lat" : startLat,
		"start_lng" : startLng,
		"end_lat" : endLat,
		"end_lng" : endLng,
		mid_path : midLatLng
	}

	// Use AJAX to post the object to our adduser service
	$.ajax({
	    type: 'POST',
	    data: searchStep,
	    url: '/stepentry',
	    dataType: 'JSON'
	}).done(function( data ) {
		var count = 0;
		$.each(data, function(){
			count++;
			if (roadID == 0) {
				isRel = this.is_rel;
				roadID = this.road_id;
				encPath = this.enc_path;
			} else {
				if (roadID != this.road_id) {
					defectPanel.innerHTML += roadID + "" + this.road_id + '<br>';
					var defectRoad = {
						"aroad_id" : roadID,
						"broad_id" : this.road_id
					}
					$.ajax({
					    type: 'POST',
					    data: defectRoad,
					    url: '/adddefect',
					    dataType: 'JSON'
					}).done(function( data ) {
					});
				}
			}
		});
		addEntry(startLat, startLng, midLatLng, endLat, endLng, encodeString, stepDis, headsign, errFlag, roadID, isRel);
	});
};

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function clearOverlays(markers, polyline) {
	if(markers) {
		for (var i = 0; i < markersArray.length; i++ ) {
			markersArray[i].setMap(null);
		}
		markersArray.length = 0;
	}
	if(polyline) {
	  for (var i = 0; i < polyArray.length; i++ ) {
	    polyArray[i].setMap(null);
	  }
	  polyArray.length = 0;
	}
}
function searchThisRoad(encodedString) {
	var searchRoad = {
		"enc_path": encodedString
	}
	// Use AJAX to post the object to our adduser service
	$.ajax({
	    type: 'POST',
	    data: searchRoad,
	    url: '/getroad',
	    dataType: 'JSON'
	}).done(function( data ) {
		$.each(data, function(){
			 console.log(this.road_id);
		});
		
	});
}

function createInfoWindow(poly) {
	google.maps.event.addListener(poly, 'click', function(event) {
		var path = poly.getPath();
		var encodeString = google.maps.geometry.encoding.encodePath(path);
		searchThisRoad(encodeString);
		clearOverlays(true, false);
		var infowindow = new google.maps.InfoWindow({
			content: "C"
		});
		var marker = new google.maps.Marker({
			position: event.latLng,
			map: map,
			opacity: 0
		});
		markersArray.push(marker);
		//infowindow.open(map,marker);
		
	});
}

function showPoly(encoded, needMarker, needZoom) {
	var decodedPath0 = google.maps.geometry.encoding.decodePath(encoded);
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < decodedPath0.length; i++) {
		bounds.extend(decodedPath0[i]);
	}
	if(needZoom) {
		map.fitBounds(bounds);
	}
	setRegion0 = new google.maps.Polyline({
		path: decodedPath0,
		strokeColor: getRandomColor(),
		strokeOpacity: 1.0,
		strokeWeight: 2,
		map: map
	});
	createInfoWindow(setRegion0);
	if (needMarker) {
	var smarker = new google.maps.Marker({
	 	position: decodedPath0[0],
		map: map,
		opacity: 1
	  });
	var emarker = new google.maps.Marker({
	 	position: decodedPath0[decodedPath0.length - 1],
		map: map,
		opacity: 0.4
	  });
	markersArray.push(smarker);
	markersArray.push(emarker);
	}
	polyArray.push(setRegion0);
}

function showSteps() {
	clearOverlays(false, true);
	var road_id = document.getElementById('roadid').value;
	var searchStep = {
		"road_id": road_id
	}

	// Use AJAX to post the object to our adduser service
	$.ajax({
	    type: 'POST',
	    data: searchStep,
	    url: '/samestep',
	    dataType: 'JSON'
	}).done(function( data ) {
		$.each(data, function(){
			showPoly(this.enc_path, true, true);
		});
	});

}

function subRel() {
	var subRelID= document.getElementById('subRel').value;
	var superRelID= document.getElementById('superRel').value;
	var changeStep = {
		"road_id": subRelID,
		"new_road_id": superRelID
	}
	$.ajax({
	    type: 'POST',
	    data: changeStep,
	    url: '/changestep',
	    dataType: 'JSON'
	}).done(function( data ) {
	});

	var deleteRel = {
		"_id": subRelID
	}
	$.ajax({
	    type: 'DELETE',
	    data: deleteRel,
	    url: '/deleterel',
	    dataType: 'JSON'
	}).done(function( data ) {
	});
}

function subRoad() {
	var subroadID= document.getElementById('subRoad').value;
	var superroadID= document.getElementById('superRoad').value;
	var changeStep = {
		"road_id": subroadID,
		"new_road_id": superroadID
	}
	$.ajax({
	    type: 'POST',
	    data: changeStep,
	    url: '/changestep',
	    dataType: 'JSON'
	}).done(function( data ) {
	});

	var deleteRoad = {
		"_id": subroadID
	}
	$.ajax({
	    type: 'DELETE',
	    data: deleteRoad,
	    url: '/deleteroad',
	    dataType: 'JSON'
	}).done(function( data ) {
	});
}

function roadToRel() {
	var roadID= document.getElementById('roadtorel').value;
	var searchRoad= {
		"_id": roadID
	}

	// Use AJAX to post the object to our adduser service
	$.ajax({
	    type: 'POST',
	    data: searchRoad,
	    url: '/findroad',
	    dataType: 'JSON'
	}).done(function( data ) {
		$.each(data, function(){
			var genRelID = generateUid();
			addRel(this.start_lat, this.start_lng, this.end_lat, this.end_lng, this.enc_path, this.distance, this.headsign, genRelID);
			var isRel = 1;
			var changeStep= {
				"road_id": roadID,
				"new_road_id": genRelID,
				"is_rel" : isRel,
			}
			$.ajax({
			    type: 'POST',
			    data: changeStep,
			    url: '/changestep',
			    dataType: 'JSON'
			}).done(function( data ) {
			});

			var deleteRoad = {
				"_id": roadID
			}
			$.ajax({
			    type: 'DELETE',
			    data: deleteRoad,
			    url: '/deleteroad',
			    dataType: 'JSON'
			}).done(function( data ) {
			});

		});
	});

}
function getAllRoads() {
	clearOverlays(true, true);	
     	var summaryPanel = document.getElementById('ratings-panel');
    $.getJSON( '/roadlist', function( data ) {
        $.each(data, function(){
	summaryPanel.innerHTML += this._id + '<br>';
        });
    });
};

function populateStepMap() {
	clearOverlays(true, true);	
    $.getJSON( '/steplist', function( data ) {
        $.each(data, function(){
	    encodedPoly = this.enc_path;
	    showPoly(encodedPoly, false);
        });
    });
};

function populateRoadMap() {
	clearOverlays(true, true);	
    $.getJSON( '/roadlist', function( data ) {
        $.each(data, function(){
	    encodedPoly = this.enc_path;
	    showPoly(encodedPoly, true);
        });
    });
};

function populateRelMap() {
	clearOverlays(true, true);	
    $.getJSON( '/rellist', function( data ) {
        $.each(data, function(){
	    encodedPoly = this.enc_path;
	    showPoly(encodedPoly, false);
        });
    });
}

function wrapper(legno, start, end) {
		var n = legno;
		setTimeout(function() {
		calcRoute(start, end);
		}, (n-1) * 5000);
}

function solvewrapper(legno,startLat, startLng, midLatLng, endLat, endLng, encodeString, stepDis) {
                var n = legno;
                setTimeout(function() {
			solveEntry (startLat, startLng, midLatLng, endLat, endLng, encodeString, stepDis);
                }, (n-1) * 500);
}

function calcRoute(start, end) {
  var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
      avoidHighways: false
  };
var summaryPanel = document.getElementById('ratings-panel');
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
	for (var p = 0; p < response.routes.length; p++) {
	var leg = response.routes[p].legs[0];
	var legseg = 0;
	for (var i = 0; i < leg.steps.length; i++) {
		var routeSegment = i + 1;
		if (leg.steps[i].distance.value > 10000) {
			legseg++;
			var startLat = leg.steps[i].start_location.lat();;
			var startLng = leg.steps[i].start_location.lng();;
			var endLat = leg.steps[i].end_location.lat();;
			var endLng = leg.steps[i].end_location.lng();;
			var stepDis = leg.steps[i].distance.value;
			var path = leg.steps[i].path;
			var encodeString = google.maps.geometry.encoding.encodePath(path);
			var midLatLng = [];
			var mid = Math.ceil(path.length/2);
			var midMin = mid - 10;
			var midMax = mid + 10;
			var j = 0;
			for(var k = midMin; k < midMax; k++) {
				midLatLng.push({
					"lat" : path[k].lat(),
					"lng" : path[k].lng()
				});
				//midLatLng[j] = path[k].toUrlValue();
				j++;
			}
			solvewrapper(p,startLat, startLng, midLatLng, endLat, endLng, encodeString, stepDis);
		}
	}
	}
    } else {
	summaryPanel.innerHTML +=  start +","+ end + '<br>';
	}
  });
}

function startPopulate() {
	var count = 0;
	$.getJSON( '/highlist', function( data ) {

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
		wrapper(count,this.start, this.end);
		wrapper(count*2,this.start, this.end);
		count++;
        });

    });
	alert("It's over");
}

function showthisPoly() {
	var enc_path = document.getElementById('enc_path').value;
	showPoly(enc_path, true);
}

function calcOneRoute() {
	var start = document.getElementById('start').value;
  	var end = document.getElementById('end').value;
	wrapper(0,start, end);
	wrapper(1,end, start);
}

google.maps.event.addDomListener(window, 'load', initialize);
  
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState("", document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: documentElement.scrollTop,
        left: documentElement.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      documentElement.scrollTop = scroll.top;
      documentElement.scrollLeft = scroll.left;
    }
  }
});
