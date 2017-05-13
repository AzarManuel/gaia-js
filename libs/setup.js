var read; var alt = [],
    min_long, max_long,
    min_lat, max_lat, cols, rows;

// Colors
var olvgreen = new THREE.Color(0x367512),
	deepblue = new THREE.Color(0x002255),
	darkgrey = new THREE.Color(0x152215),
	warmgrey = new THREE.Color(0x666655),
	litegrey = new THREE.Color(0x547556),
	vltegrey = new THREE.Color(0xeeeeee),
	aplgreen = new THREE.Color(0x00ff00),
	briteylo = new THREE.Color(0xffff00),
	drkgreen = new THREE.Color(0x225511),
	srfwhite = new THREE.Color(0xffffff),
	smrfblue = new THREE.Color(0x112299),
	curvlite = new THREE.Color(0x457836),
	curvdark = new THREE.Color(0x366530);

// Date Setup
var month = ['jan','feb','mar','apr','may','jun',
			 'jul','aug','sep','oct','nov','dec']

var d = new Date()
var day = d.getDate()
var mon = d.getMonth() //mon++;
var hour = d.getHours() 
var min = d.getMinutes() 

if (day == 1) 	   {suffix = ' st'}
else if (day == 2) {suffix = ' nd'}
else if (day == 3) {suffix = ' rd'}
else 			   {suffix = ' th'}

//Aspect Ratio
var width = window.innerWidth-5, height = window.innerHeight-5;
var ratio = width/height, depth = 10000
var pi = Math.PI, d2r = pi/180, r2d = 180/pi

//Scene Setup
var paused = false, riverPause = true;
var clock = new THREE.Clock;
var renderer = new THREE.WebGLRenderer({ antialias: false, precision: "lowp", preserveDrawingBuffer: true, alpha: true});
var camera = new THREE.PerspectiveCamera(45,ratio,0.1,depth)
var sunLight = new THREE.DirectionalLight({color: 0xffffff})
var controls = new THREE.OrbitControls(camera,renderer.domElement)	
var orbitPos = controls.object.position;
var scene = new THREE.Scene();
var stats = new Stats();

// Global Variables

var latitude = (max_lat+min_lat)/2, longitude = (max_long+min_long)/2;
var altmin = 0, altmax = 240, ncurves = 30, dx = 0, vertice = 0
var dryVert = 0, wetVert = 0, slopeVert=0, shore = 2.4
var cols = cols-1, rows = rows-1 // scalefac = 10/cols
var lat_fac = 111*Math.cos(d2r*latitude)*1000
var site_width = (max_long -min_long)*lat_fac
var square = 1200/cols, vs = 1800/site_width 
var ofx = (cols)*square/2, ofy = (rows)*square/2
var Cx = ofx +840, Cy = ofy -360, Cz = 0
var steps_hr = 12 // vs = 0.75*32/cols  

var diag;

var jundawn = 6*Math.cos(latitude*d2r)
var decdawn = 6 +6*Math.abs(Math.sin(latitude*d2r))
var difdawn = decdawn -jundawn, hrinit = 9

var lat_a, lat_b, lat_c, lat_d
var adt_a, adt_b, adt_c, adt_d
var alt_a, alt_b, alt_c, alt_d
var lat = [], adt = [], elv = [];
var Px = [], Py = [], Pz = []
	
var view_dir = 210;

var sunSpan = document.getElementById("sunSpan"), runoffSpan = document.getElementById("runoffSpan");

/*__________________________________________________________________________
 
						Data Pack for Feedback
 ___________________________________________________________________________*/

function isOdd(val) { return val % 2 }

 // draw_base
function set_dimlim(){
	altmin = alt[0][0]; altmax = altmin;
	for (var row = 0; row <= rows; row++) {
		for (var col = 0; col <= cols; col++) {
			altac = alt[row][col]
			if (altac < altmin) altmin = altac
			if (altac > altmax) altmax = altac } }
	int_temp = (altmax -altmin)/ncurves
	curvint = 5*Math.ceil(0.2*int_temp)
	for (var row = 0; row <= rows; row++) {
		for (var col = 0; col <= cols; col++) {
		alt[row][col] = alt[row][col] - altmin +0 }}
	} 

window.onresize = function(event) {
    THREEx.WindowResize(renderer,camera)	
	 };

// Spacebar
document.addEventListener("keyup", function(_onKeyUp){
	if(_onKeyUp.keyCode == 80){
		if(paused){
			paused = false
			sunSpan.innerHTML = "Pause";
			update_time(n);
			diagSun = sun_pos(mon,day, hour,min)
			place_sun(mon,day, hour,min)
			sunSpan.innerHTML = "Stop";
			document.getElementById("mon").innerHTML = month[mon]+" "
			document.getElementById("day").innerHTML = day + suffix
		}
		else{ 
			paused = true; 
			sunSpan.innerHTML = "Track";
		}
	}}, false);

function cameras() {
	camera.position.x =-1200
	camera.position.y = 2400
	camera.position.z = 3600
	camera.setLens(120)
	scene.add(camera)
	scene.add(sunLight)
	}

function format_min(value) {
	var whole = Math.trunc(value)
	var suplm = ""
	var fractional = Math.abs(value -whole)
	var min_fractn = Math.trunc(fractional*60)
	if (min_fractn < 10) suplm = "0"
    min_frac = suplm +min_fractn
	//console.log("min ", min_fractn)
	return whole +":" +min_frac
	}






