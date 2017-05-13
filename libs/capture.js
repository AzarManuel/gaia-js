// This script grabs elevation data through the google maps api.
// Author: Guy Pommares, Manuel Azar, River Allen
// Copyright 2014

var Capture = (function () {
    const COLS = 33, // fixed number of data points across
        ROWS_PER_SLICE = 8, // size of capture slice
        DEFAULT_PLACE = {
            'top': 10.588, //max latitude
            'bottom': 10.564, //min latitude
            'left': -66.070, //min longitude
            'right': -66.046 //max longitude
        },
        MAP_OPTIONS = {
            mapTypeId: 'terrain',
            disableDoubleClickZoom: true,
            disableDefaultUI: true,
            zoomControl: true,
            zoom: 14,
            center: {
                lat: (DEFAULT_PLACE.top + DEFAULT_PLACE.bottom) / 2,
                lng: (DEFAULT_PLACE.left + DEFAULT_PLACE.right) / 2
            },
            zoomControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            }
        },
        DRAW_OPTIONS = {
            drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_LEFT,
                drawingModes: [google.maps.drawing.OverlayType.RECTANGLE]
            },
            rectangleOptions: {
                strokeColor: '#aaaaaa',
                strokeWeight: 1,
                fillColor: '#bbbbbb',
                fillOpacity: 0.3,
                editable: true,
                draggable: true
            }
        };

//DOM Caching
    var captureBtn = document.getElementById('captureBtn'),
        abortBtn = document.getElementById('abortBtn'),
        legend = document.getElementById('legend'),
        leftInfo = document.getElementById("leftInfo"),
        textOutput = document.getElementById('textOutput'),
        searchbar = document.getElementById('pac-input'),


        elevator, map, drawingManager,
        loader = progressBar(),
        loaderWrapper = loader.getDiv(),

        capture, numberOfRows, slices, sliceHeight,
        rectangle, infoWindow, width, height, spacing,
        minLng, maxLng, minLat, maxLat,
        timerId, q, searchBox;

    google.maps.event.addDomListener(window, 'load', initMap);

    /**
     * Fetch CSV Slice to Capture
     * @param elevations
     */
    function fetchSlice(elevations) {
        capture[capture.length] = elevations; //Fetch elevations slice to array
        loader ? loader.updateBar(1) : null; //Increase loader count
    }

    /**
     * Set Capture Dimensions
     */
    function setDimensions() {
        width = maxLng - minLng;         // horizontal capture limits
        height = maxLat - minLat;       // vertical capture limits
        q = height / width;               // capture rectangle ratio
        numberOfRows = Math.trunc(COLS * q);      // proportional number of rows
        slices = Math.ceil(numberOfRows / ROWS_PER_SLICE); // number of slices
        sliceHeight = height / slices;  // height of each slice
        spacing = width / COLS;            // The geographical distance between data points
    }


    /**
     * Display capture aspect ratio
     */
    function showAspectRatio() {
        textOutput.innerHTML = '<h2>columns ' + COLS + ',  aspect ratio ' + Math.round(100 * q) + '%<br><h2>'
    }

    /**
     * Start to capture the elevation data
     */
    function start() {
        println("<h2>Processing data segments, please wait</h2>"); //Tell user to wait
        capture = []; //initialize
        loaderWrapper.style = "box-shadow: 1px 1px #888;display: none;width: 290px;height: 1.3em;margin-right: 6px;border: 1px solid #BBB;background: #FFF none repeat scroll 0% 0%;font-size: 12px;text-align: left;z-index: 0;position: absolute;top: 110px;left: 0px;margin-left: 14px;";
        disableControls();

        queryElevation(minLat, minLng, maxLng, fetchSlice);


        timerId = setInterval(function () {
            if (capture.length >= slices) {
                searchBox.setBounds(null);
                sendData(capture);
                end();
            }
            else {
                minLat = minLat - sliceHeight;
                maxLat = maxLat - sliceHeight;
                queryElevation(minLat, minLng, maxLng, fetchSlice);
            }
        }, 800);
    }

    function initMap() {

        elevator = new google.maps.ElevationService(); //Define elevation service
        map = new google.maps.Map(document.getElementById('map-canvas'), MAP_OPTIONS); //Create Map Object
        infoWindow = new google.maps.InfoWindow(); // Define an info window on the map.
        drawingManager = new google.maps.drawing.DrawingManager(DRAW_OPTIONS); // Create Drawing Manager
        searchBox = new google.maps.places.SearchBox(searchbar);// Create the search box and link it to the UI element.;



        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function () {
            searchBox.setBounds(map.getBounds());
        });

        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function () {
            var places = searchBox.getPlaces();
            if (places.length == 0) {
                return;
            }
            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            places.forEach(function (place) {
                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            map.fitBounds(bounds);
        });


        //Add buttons to control bar
        map.controls[google.maps.ControlPosition.LEFT_TOP].push(textOutput);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(captureBtn);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(abortBtn);
        map.controls[google.maps.ControlPosition.LEFT_TOP].push(loaderWrapper);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchbar);
        map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(leftInfo); //Bottom Center Text
        drawingManager.setMap(map); // Loading the drawing Tool in the Map.

        //Rectangle Draw Complete Event
        google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
            if (event.type == google.maps.drawing.OverlayType.RECTANGLE) {
                if (rectangle) rectangle.setMap(null); //Remove Previous Selection
                rectangle = event.overlay;
                setBounds();
                setDimensions();
                captureBtn.style.display = "block";
                showAspectRatio();
                rectangle.addListener('bounds_changed', function () {
                    showAspectRatio();
                    setBounds();
                    setDimensions();
                });
            }
        });

        //Draw Mode Change Event
        google.maps.event.addListener(drawingManager, "drawingmode_changed", function () {
            if ((drawingManager.getDrawingMode() == google.maps.drawing.OverlayType.RECTANGLE) && rectangle) {
                rectangle.setMap(null);
                rectangle = null;
                toggleStartButton();
                textOutput.innerHTML = '<h1>Click and Drag to Select Area<h1>';
            }
        });
        textOutput.innerHTML = '<h1>Click and Drag to Select Area<h1>';
    }

    function sendData(capture) {
        sessionStorage.setItem('csv', capture);
        window.location = "Gaia_load.html";
    }

    function setBounds() { //Set rectangle bounds
        var ne = rectangle.getBounds().getNorthEast().toJSON(),
            sw = rectangle.getBounds().getSouthWest().toJSON();
        minLat = sw.lat;
        maxLat = ne.lat;
        minLng = sw.lng;
        maxLng = ne.lng;
    }

    function setCoordinates() { // Prepare Array of elevations  at each position in grid
        for (var points = [], i = 0, j, y, x; i < ROWS_PER_SLICE; i++) {   // for each row of the slice
            y = maxLat - (spacing * i);      // calculate the y geographical value
            for (j = 0; j < COLS; j++) {          // for each column of the row
                x = minLng + (spacing * j);    // calculate the x geographical value
                points.push(new google.maps.LatLng(y, x));  // push val por pt
            }
        }
        return points;
    }

    function fetchElevation(results) { // Fetch results into elevation array
        var elevation = [];
        if (capture.length <= 0) { //start by storing limits
            elevation.push(minLng.toFixed(5), maxLng.toFixed(5), minLat.toFixed(5), numberOfRows, COLS);  // site limits, rows, cols
        }

        for (var row = 0, col = 0, count = 0, length = results.length; row <= ROWS_PER_SLICE; row++) { //for each row of the slice
            for (col = 0; col <= COLS; col++) { // for each column of the row
                if (count < length) { //We dont want garbage data
                    elevation.push(Math.round(results[count].elevation)); // fetch coordinate elevation
                }
                count++;
            }
        }
        return elevation;
    }

    /**
     * Handle capture errors
     * @param status
     */
    function handleErrors(status) {
        clearInterval(timerId);
        enableControls();
        typeof status != 'undefined' ? println('<br><br><h2>Elevation service failed due to: ' + status + ', Please try Again<h2>')
            : println('<br><br><h2>No Results Found, Please try Again<h2>');
    }

// https://developers.google.com/maps/documentation/javascript/examples/elevation-simple
    function queryElevation(minLat, minLng, maxLng, callback) { // query Gmaps n feed array
        elevator.getElevationForLocations({'locations': setCoordinates()}, function (results, status) {
            status == google.maps.ElevationStatus.OK ?
                (results ? callback(fetchElevation(results)) : handleErrors()) //Fetch data or show no results
                : handleErrors(status); //Error status
        });
    }

    /**
     * Output text in top left corner
     * @param message
     */
    function println(message) {
        textOutput.innerHTML = textOutput.innerHTML + message;
    }

    /**
     * End current capture
     */
    function end() {
        clearInterval(timerId);
        capture = [];
        enableControls();
    }

    /**
     * Enable controls for data capture
     */
    function enableControls() {
        loader.hide();
        drawingManager.setOptions({drawingControl: true});
        abortBtn.style.display = "none";
        captureBtn.style.display = "block";
        rectangle.setMap(null);
        rectangle.draggable = true;
        rectangle.editable = true;
        rectangle.setMap(map);
        searchbar.style.display = "block";
        showAspectRatio();
    }

    /**
     * Disable Controls while capturing
     */
    function disableControls() {
        loader.start(slices);
        drawingManager.setDrawingMode(null);
        drawingManager.setOptions({drawingControl: false});
        captureBtn.style.display = "none";
        abortBtn.style.display = "block";
        searchbar.style.display = "none";
        rectangle.setMap(null);
        rectangle.editable = false;
        rectangle.draggable = false;
        rectangle.setMap(map);
    }

    /**
     * Toggle Start Capture Button
     */
    function toggleStartButton() {
        rectangle ? captureBtn.style.display = "none" : captureBtn.style.display = "block";
    }

    /**
     * Accessible Methods
     */
    return {
        start: start,
        end: end
    }

})();