/*__________________________________________________________________________
 
						GUI Control functions
 ___________________________________________________________________________*/

// Check Active/Buttons Buttons
function checkButtons() {
	if(squares){document.getElementById("gridBtn").style.backgroundImage = 'url("img/grid_on.png")'}
	else{document.getElementById("gridBtn").style.backgroundImage = 'url("img/grid_off.png")'}
	if(fill){ document.getElementById("fillBtn").style.backgroundImage = 'url("img/sun_on.png")'
		document.getElementById("dateInfo").style.display = "block" }
	else{document.getElementById("fillBtn").style.backgroundImage = 'url("img/sun_off.png")'}
	if(contours){document.getElementById("contourBtn").style.backgroundImage = 'url("img/contours_on.png")'}
	else{document.getElementById("contourBtn").style.backgroundImage = 'url("img/contours_off.png")'}
	if(slopes){ document.getElementById("slopeBtn").style.backgroundImage = 'url("img/slope_on.png")'}
	else{ document.getElementById("slopeBtn").style.backgroundImage = 'url("img/slope_off.png")' }
	if(exposure){document.getElementById("exposureBtn").style.backgroundImage = 'url("img/exposure_on.png")'}
	else{document.getElementById("exposureBtn").style.backgroundImage = 'url("img/exposure_off.png")'}
	if(runoff){document.getElementById("runoffBtn").style.backgroundImage = 'url("img/runoff_on.png")'}
	else{document.getElementById("runoffBtn").style.backgroundImage = 'url("img/runoff_off.png")'}
	if(contacts){document.getElementById("contactBtn").style.backgroundImage = 'url("img/contact_on.png")'}
	else{document.getElementById("contactBtn").style.backgroundImage = 'url("img/contact_off.png")'}
	if(soils){document.getElementById("soilsBtn").style.backgroundImage = 'url("img/soils_on.png")'}
	else{document.getElementById("soilsBtn").style.backgroundImage = 'url("img/soils_off.png")'}  }

// Check POV Base Cuadrant // 
function check_view() {
	var view_dir = 0, angle = 0, add = 0
	var cuadrant = 0, cuad_prev = 0;  
    if (camera.position.x < 0) { add = 180 }
    if (camera.position.x) 
    	{ angle = Math.atan(-camera.position.z/camera.position.x) }
    else { angle = d2r*90*Math.sign(camera.position.z) }
    view_dir = (90 -Math.round(r2d*angle) +add) % 360 

    if (view_dir < 90) cuadrant = 1 
	else if (view_dir < 180) cuadrant = 2 
	else if (view_dir < 270) cuadrant = 3 
    else cuadrant = 4 
    if (!(cuadrant == cuad_prev)) change_view(cuadrant) 
    cuad_prev = cuadrant }
	
// Show/Hide POV Base Faces
function change_view(cuadrant) {
	switch (cuadrant) {
    case 1: group.children[0].visible = true;group.children[1].visible = true
	    	group.children[2].visible = false;group.children[3].visible = false
	    	group.children[4].visible = true;group.children[5].visible = true
	    	group.children[6].visible = false;group.children[7].visible = false
	        break;
    case 2: group.children[0].visible = false;group.children[1].visible = false
	    	group.children[2].visible = true;group.children[3].visible = true
	    	group.children[4].visible = true;group.children[5].visible = true
	    	group.children[6].visible = false;group.children[7].visible = false
	        break;
    case 3: group.children[0].visible = false;group.children[1].visible = false
	    	group.children[2].visible = true;group.children[3].visible = true
	    	group.children[4].visible = false;group.children[5].visible = false
	    	group.children[6].visible = true;group.children[7].visible = true
		    break;
    default:group.children[0].visible = true;group.children[1].visible = true
	    	group.children[2].visible = false;group.children[3].visible = false
	    	group.children[4].visible = false;group.children[5].visible = false
	    	group.children[6].visible = true;group.children[7].visible = true
        }   }
	
//Print button function
function printTerrain(){
	renderer.setClearColor( 0xFFFFFF, 0 )
	renderer.render(scene, camera)
    window.open( renderer.domElement.toDataURL("image/png"),"Final")												   
	renderer.setClearColor( 0x909090 );
	renderer.render(scene, camera) }

function resetCamera() {
	camera.position.x =-1200
	camera.position.y = 2400
	camera.position.z = 3600
	controls.object.position = orbitPos
	controls.update();
	renderer.render(scene,camera) }	

function update_time(n) {
	hr = hrinit +n/steps_hr
	hour = Math.floor(hr)
	min = (hr-hour)*60  }

// Buttons //
$('#gridBtn').on('click', function (e) {
	if(squares) {
		document.getElementById("gridBtn").style.backgroundImage = 'url("img/grid_off.png")'
		scene.remove(baseSquares); squares = false }
	else { document.getElementById("gridBtn").style.backgroundImage = 'url("img/grid_on.png")'
		scene.add(baseSquares); squares = true } } )

$('#fillBtn').on('click', function (e) {
	if(fill) {
		document.getElementById("fillBtn").style.backgroundImage = 'url("img/sun_off.png")'
		document.getElementById("dateInfo").style.display = "none"
		document.getElementById("sunPause").style.display = "none"
		scene.remove(landMesh); scene.remove(waterMesh); shore_color = deepblue
		baseShore.traverse(function(child){
			if(child.children.length <= 0){
				if(child.material.color.equals(srfwhite))child.material.color = smrfblue
			}	
		})
		scene.remove(solarDiag); scene.remove(sol); fill = false }
	else {
		document.getElementById("fillBtn").style.backgroundImage = 'url("img/sun_on.png")'
		document.getElementById("dateInfo").style.display = "block"
		document.getElementById("sunPause").style.display = "table-cell"
		baseShore.traverse(function(child){
			if(child.children.length <= 0){
				if(child.material.color.equals(smrfblue))child.material.color = srfwhite
			}	
		})
		scene.add(landMesh); scene.add(waterMesh);
		scene.add(solarDiag); scene.add(sol); fill = true } } )

$('#contourBtn').on('click', function (e) {
	if(contours) {
		document.getElementById("contourBtn").style.backgroundImage = 'url("img/contours_off.png")'
		scene.remove(baseContours)
		contours = false}
	else {
		document.getElementById("contourBtn").style.backgroundImage = 'url("img/contours_on.png")'
		scene.add(baseContours); contours = true } } )

$('#slopeBtn').on('click', function (e) {
	if(slopes) {
		document.getElementById("slopeBtn").style.backgroundImage = 'url("img/slope_off.png")'
		document.getElementById("slopeClass").style.display = "none"
		scene.remove(slopeMesh); slopes = false }
	else {
		document.getElementById("slopeBtn").style.backgroundImage = 'url("img/slope_on.png")'
		document.getElementById("slopeClass").style.display = "block"
		scene.add(slopeMesh); slopes = true } } )

$('#runoffBtn').on('click', function (e) {
	if(runoff) {
		document.getElementById("runoffBtn").style.backgroundImage = 'url("img/runoff_off.png")'
		document.getElementById("runoffPause").style.display = "none"	
		scene.remove(baseDrain); runoff = false }
	else {
		document.getElementById("runoffBtn").style.backgroundImage = 'url("img/runoff_on.png")'
		document.getElementById("runoffPause").style.display = "table-cell"	
		scene.add(baseDrain); runoff = true } } )

$('#exposureBtn').on('click', function (e) {
	if(exposure) {
		document.getElementById("exposureBtn").style.backgroundImage = 'url("img/exposure_off.png")'
		scene.remove(baseExposure); exposure = false }
	else {
		document.getElementById("exposureBtn").style.backgroundImage = 'url("img/exposure_on.png")'
		scene.add(baseExposure); exposure = true } } )
$('#contactBtn').on('click', function (e) {
	if(contacts) {
		document.getElementById("contactBtn").style.backgroundImage = 'url("img/contact_off.png")'
		document.getElementById("contactSel").style.display = "none"
		scene.remove(cloudSystem); contacts = false }
	else {
		document.getElementById("contactBtn").style.backgroundImage = 'url("img/contact_on.png")'
		document.getElementById("contactSel").style.display = "table-cell"
		scene.add(cloudSystem); contacts = true } } )

$('#soilsBtn').on('click', function (e) {
	if(soils) {
		document.getElementById("soilsBtn").style.backgroundImage = 'url("img/soils_off.png")'
		scene.remove(soilSystem); soils = false }
	else {
		document.getElementById("soilsBtn").style.backgroundImage = 'url("img/soils_on.png")'
		scene.add(soilSystem); soils = true } } )

$('#dateLaunch').on('click', function(e) {
	$('#datetimepicker1').datetimepicker({
                sideBySide: true,
				viewMode: 'months',
				defaultDate: moment() } ) 

	$('#datetimepicker1').datetimepicker('setDate', new Date())

	$('#dateModal').modal({backdrop: 'true', keyboard: true})

    $('#dateModal').modal('show') } )

$("#dateForm").submit(function(event) {

	event.preventDefault()
	
	var inputDate = $("#dateValue").val()
	if( typeof inputDate === 'undefined' || inputDate === null || inputDate == '') 
		$('#dateValue').val('') 
	else {
		var dateMomentized = moment(inputDate)
		var month = dateMomentized.month()
		var day = dateMomentized.date()
		var hours = dateMomentized.hours()
		var minutes = dateMomentized.minutes()
		setTimeout(function() { 
			$('#dateModal').modal('hide')
			diagSun = sun_pos(month,day, hours,minutes)
			place_sun(month,day,hours,minutes); paused = true
			sunSpan.innerHTML = "Track";
			document.getElementById("mon").innerHTML = dateMomentized.format("MMM") + " "
			document.getElementById("day").innerHTML = dateMomentized.format("DD") + " "
			document.getElementById("hour").innerHTML = dateMomentized.format("HH") + " "
			document.getElementById("min").innerHTML = dateMomentized.format("mm") + " " }, 100) }
	} )

function pauseSun() {
	if(paused) {
		paused = false;
		update_time(n);
		diagSun = sun_pos(mon,day, hour,min)
		place_sun(mon,day, hour,min)
		sunSpan.innerHTML = "Stop";
		document.getElementById("mon").innerHTML = month[mon]+" "
		document.getElementById("day").innerHTML = day + suffix }
	else {
		paused = true;
		sunSpan.innerHTML = "Track" }  }

function changeWind() {
	$('#windModal').modal({ backdrop: 'static', keyboard: false })   // initialized with no keyboard
}

function updateInfo(){
	document.getElementById("lat").innerHTML = format_min(Math.abs(latitude)) +st_lat      
	document.getElementById("long").innerHTML = format_min(Math.abs(longitude)) +st_long     
	document.getElementById("mon").innerHTML = month[mon]+" "
	document.getElementById("day").innerHTML = day + suffix
}

$("#windModal").on('hide.bs.modal',function() {
	console.log("rows/cols",rows,cols)
	redrawClouds(rows,cols) } )

function pauseRunoff() {
	if(riverPause){ riverPause = false;
		runoffSpan.innerHTML = "Pause" }
	else { riverPause = true;
		runoffSpan.innerHTML = "Flow" } }

$("#aboutModal").on('hidden.bs.modal',function(){
	THREEx.WindowResize(renderer,camera);	
});