/*______________________________________________________________
|																|
|				GAIA  Landform and patterns model 				|			  								
|																|
|            	Guy Pommares,  and Luis Rodriguez				|
|            	Manuel Azar, and Alexis Rodriguez				|
|            	(c) La Vida ca        may 22 1967				|
|            	last modified    february 20 2015				|
|																|
|______________________________________________________________*/


// Global variables
renderer.setSize(width, height);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( 0x909090 );

controls.minDistance = altmax + 200
controls.maxDistance = 6000

var floDelay = 0, sections = 3, slowflow = 3           // drain cut into sections
//token = 0;      // frame token
	
var wind = 60            // default wind direction
var ro = 24, co = 30
//var ro = 28, co = 16

// Show / Hide Enviromental Patterns
var contours = true, squares = false, exposure = false, fill = true, 
	slopes = false, runoff = false, soils = false, contacts = false;

/**/
function format_min(value) {
	var whole = Math.trunc(value)
	var suplm = ""
	var fractional = Math.abs(value -whole)
	var min_fractn = Math.trunc(fractional*60)
	if (min_fractn < 10) suplm = "0"
    min_frac = suplm +min_fractn
	return whole +":" +min_frac }
	
var st_lat, st_long
if (latitude > 0) st_lat = " N"; else st_lat = " S"
if (longitude > 0) st_log = " E"; else st_long = " W"
document.body.appendChild(renderer.domElement)


stats.domElement.style.position = 'absolute'
stats.domElement.style.top = '0'
stats.domElement.style.left = '0'
stats.domElement.style.zIndex = 100

/*__________________________________________________________________________
 
					Object Definition Procedures
 ___________________________________________________________________________*/
 
//Compute Normals                            // export to setup
function compute_vertxFaces() {
	landGeometry.computeFaceNormals()
	landGeometry.computeVertexNormals()
	waterGeometry.computeFaceNormals()
	waterGeometry.computeVertexNormals()
	slopeGeometry.computeFaceNormals()
	slopeGeometry.computeVertexNormals()
	}

// Add Scene Objects
function add_objects() {
	scene.add(baseShore);
	scene.add(edgeSquares);

	if (soils) scene.add(soilSystem);	
	if (contacts) {
		scene.add(cloudSystem);
		document.getElementById("contactSel").style.display = "table-cell" }
	
	if (squares) scene.add(baseSquares);
	if (exposure) scene.add(baseExposure);
	if (runoff) { scene.add(baseDrain);
		runoffPause.style.display = "table-cell" }	
	
	if (contours) scene.add(baseContours)
	
	if (fill) {
		scene.add(landMesh); scene.add(waterMesh);
		scene.add(diag); scene.add(sol);
		document.getElementById("dateInfo").style.display = "block"
		document.getElementById("sunPause").style.display = "table-cell" }
	
	if(slopes) { 
		scene.add(slopeMesh)
		scene.add(waterMesh) }
	}

/*__________________________________________________________________________
 
					Main Program 
 ___________________________________________________________________________*/
 

// MAIN LOOP
function render() {
	requestAnimationFrame(render);
	controls.update(); stats.update();
	if (!paused && fill) {
		steps = steps_hr*(24 - 2*hrinit) // Minute Steps
		if (n >= steps) n = 0  
		else { n += 1; update_time(n)
			diagSun = sun_pos(mon,day, hour,min)
			place_sun(mon,day, hour,min) } }
	if (!riverPause && runoff) {	
		if(floDelay == slowflow) {
			flo_water()
			floDelay = 0 }
		floDelay++ }
	check_view()
	renderer.render(scene,camera) }
	
// Main Draw
function draw_grid(rows,cols){ 
/*		for(var j =  0; j < 3; j++){
			for(var i =  0; i < cols; i++){
				console.log("row: " + j + " col: " + i + " val: " + alt[j][i]);
			}	
		}	*/
	var exit  = { x: 0, y: 0, side: 0 }
	var dcols = cols +1
	for (var row = 0; row <= rows; row++) { 
		for (var col = 0; col <= dcols; col++) {
			fill_quarters(col,row,square)  // Draw Terrain
			slope_quarters(col,row, square)  // Draw Slope
			if (col <= cols && row < rows)   {
				get_corners(col,row, square) // setup
				check_contours(col,row, elv) // Draw Contr
				draw_square(col,row)   //Draw grid squares
				//if (row && col)
				if ( row == ro && col == co ) {  console.log(" row ", row, " col ", col)  }
				exit = draw_drain(col,row,1) // señala
				//exit = draw_drain(col,row,2)  // traza
				exit = run_off(col,row)  // Roll the bead} 
				} } }
	diag = draw_diagram(Cx,Cy); //Draw Diagram
	}

//Initialize
function init() { cols = cols -1
	set_dimlim()      // Set Aspect Ratio
	draw_grid(rows, cols) // Draw Terrain
	draw_bases()		// Draw base faces
	compute_vertxFaces()    // solid fill
	add_objects()      // user selections
	cameras()        // set point of view
	checkButtons() // Check button status
	updateInfo() //Update lat,lng, day info (Lower Left Corner)
	render() //Go!
}

