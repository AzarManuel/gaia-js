/*__________________________________________________________________________
 
						Storm Runoff Drawing Routines
 ___________________________________________________________________________*/
 
var baseDrain = new THREE.Object3D();
var slope = { x: 0, y: 0, z: 0 }, ant_slope = slope
var enter = { x: 0, y: 0, side: 0 }
var exit =  { x: 0, y: 0, side: 0 }
var sq = square, colorcountr = 0
var slopevect, anteslope

var blues = [new THREE.Color(0x224466),new THREE.Color(0x336699),new THREE.Color(0x4488cc)]

function draw_runoff(col,row, enter,exit) {
	var dx,dy,dz, len,ls,ns,secsize   
	var xi,yi,zi, xo,yo,zo, xa,ya,za, xb,yb,zb, xs,ys,zs   
	xi = lat[0] +enter.x; yi = adt[0] +enter.y; zi = enter.z
	xo = lat[0] +exit.x; yo = adt[0] +exit.y; zo = exit.z
	secsize = square/sections; dx = xo-xi, dy = yo-yi, dz = zo-zi
	
	len = Math.pow(dx*dx +dy*dy, 0.5); 
	ns = Math.trunc(len/secsize); if (ns == 0) ns = 1; ls = len/ns
	if (len) { rat = ls/len; 
		xa = xi, ya = yi, za = zi
		xs = dx*rat; ys = dy*rat; zs = dz*rat
		
		for (var n = 1; n <= ns; n++) {
			xb = xi +n*xs, yb = yi +n*ys, zb = zi +n*zs
			color = blues[(colorcountr % 3)]
			baseDrain.add(draw_segment(xa,ya,za, xb,yb,zb, color)) 
			xa = xb; ya = yb; za = zb
			colorcountr++ }    
	}  }
		
function flo_water(){
	baseDrain.traverse(function(child){
		if(child.children.length <= 0){
			if     (child.material.color.equals(blues[0])) child.material.color = blues[2]; 	
			else if(child.material.color.equals(blues[1])) child.material.color = blues[0];
			else if(child.material.color.equals(blues[2])) child.material.color = blues[1];
			}	}	)
	}
	
function calc_elev(z_beg,dxy,z_end) {
	var dz = elv[z_end] -elv[z_beg]
	var elev = elv[z_beg] +dz*(dxy/square)
	return elev }
	
function check_out(exit, mod) { var elev // exit elevation
	if ( mod == 0 ) { // exit to opposite side
		if (exit.y == 0) // exit to North side
			 { exit.side = 0; elev = calc_elev(0,exit.x,1) }
		else { exit.side = 2; elev = calc_elev(3,exit.x,2) }  }
	if ( mod == 1 ) { // exit to adjacent side
		if (exit.x == 0)  // exit to West side
			 { exit.side = 3; elev = calc_elev(0,exit.y,3) }
		else { exit.side = 1; elev = calc_elev(1,exit.y,2) } }
	if ( mod == 2 ) { // exit to opposite corner
		if (exit.x == square && exit.y == 0) {
			exit.side = 4; elev = elv[1] } // exit NW
		else if (exit.x == square && exit.y == square) {
			exit.side = 5; elev = elv[2] } // exit NE
		else if (exit.x == 0 && exit.y == square) {
			exit.side = 6; elev = elv[3] } // exit SE
		else if (exit.x == 0 && exit.y == 0) 
			exit.side = 7; elev = elv[0] } // exit SW
	exit.z = elev
	return exit }
	
function cross_NS(enter,slope) { // mod flag signals type of exit
	var mod  // whether exit side is adjacent, opposite or corner
	var exit  = { x: 0, y: 0, z: 0, side: 0 }
	var x_treme = (square/2)*(1 +sign_of(slope.x))
	var y_treme = square -enter.y, dx = 0, dy = 0
	var sgnx = sign_of(slope.x), sgny = -1, qsl = 0

	if (slope.y) { if (enter.y) sgny = 1  // not flat, not corner
		if (slope.x) { qsl = Math.abs(slope.y/slope.x)
			exit.x = x_treme; dx = exit.x -sgnx*enter.x
			dy = dx*Math.abs(qsl); exit.y = enter.y -sgny*dy 
			mod = 1; exit = check_out(exit, mod) } // find side y
		else { exit.x = enter.x; exit.y = y_treme // if flat in x
			mod = 0; exit = check_out(exit, mod) } }
    else { exit.x = x_treme; exit.y = enter.y 
			mod = 1; exit = check_out(exit, mod) }

    if (Math.abs(exit.y -enter.y) == square && (exit.x -enter.x))
    	    mod = 2; exit = check_out(exit, mod) 
	if (Math.abs(exit.y -enter.y) > square) {
			exit.x = enter.x +sgnx*(square/qsl) 
    		exit.y = y_treme; 
			mod = 0; exit = check_out(exit, mod) }
	if ((enter.y == 0 && slope.y < 0) 
   		 	|| (enter.y == square && slope.y > 0)) {
   			exit.x = x_treme; exit.y = enter.y
			mod = 1; exit = check_out(exit, mod) }
   	return exit }
	
function cross_EW(enter,slope) {
	var exit  = { x: 0, y: 0, z: 0, side: 0 }, mod
	var x_treme = square-enter.x, dx = 0, dy = 0
	var y_treme = (square/2)*(1 +sign_of(slope.y))
	var sgny = sign_of(slope.y), sgnx = -1, qsl = 0
	
	if (slope.x) { if (enter.x) sgnx = 1
		if (slope.y) { qsl = Math.abs(slope.x/slope.y)
			exit.y = y_treme; dy = exit.y -sgny*enter.y
		    dx = dy*Math.abs(qsl); exit.x = enter.x -sgnx*dx 
			mod = 0; exit = check_out(exit, mod) }
		else { exit.y = enter.y; exit.x = x_treme
			mod = 1; exit = check_out(exit, mod) }	}
    else { exit.x = enter.x; exit.y = y_treme
    		mod = 0; exit = check_out(exit, mod) }

    if (Math.abs(exit.x -enter.x == square) && (exit.x -enter.x)) 
    		{ mod = 2; exit = check_out(exit, mod) }
    if (Math.abs(exit.x -enter.x) > square) {
    	    exit.x = x_treme;
    		exit.y = enter.y +sgny*(square/qsl)
    		mod = 1; exit = check_out(exit, mod) }
   	if ((enter.x == 0 && slope.x < 0) 
   		 	|| (enter.x == square && slope.x > 0)) {
   			exit.x = enter.x; exit.y = y_treme
   			mod = 0; exit = check_out(exit, mod) }
   	return exit }
	
function next_cell(side) {
	var add  = { col: 0, row: 0 }
	if (side == 0) add.row--; if (side == 2) add.row++
	if (side == 1) add.col++; if (side == 3) add.col--
	if (side == 4) {add.col++; add.row-- } 
	if (side == 5) {add.col++; add.row++}
	if (side == 6) {add.col--; add.row++ } 
	if (side == 7) {add.col--; add.row--}
	return add }
	
function exit_to_enter(exit, enter) { enter = exit // start equal
	if (exit.side == 0) enter.y = square      // off to the North
	else if (exit.side == 1) enter.x = 0       // off to the West
	else if (exit.side == 2) enter.y = 0      // off to the South
	else if (exit.side == 3) enter.x = square  // off to the East
	else if (exit.side == 4) { enter.x = 0; enter.y = square }
	else if (exit.side == 5) { enter.x = 0; enter.y = 0 }
	else if (exit.side == 6) { enter.x = square; enter.y = 0 }
	else if (exit.side == 7) { enter.x = square; enter.y = square }
	enter.side = (exit.side +2) %4 // opposite side reduced to 0,3
	if (exit.side > 3) enter.side += 4  // add 4 for enter corners
	return enter }

/*_____________________________________________________________________*/

/*                               SOILS                                 */
/*_____________________________________________________________________*/

var theSoils = new THREE.Geometry(),
	soilMaterial = new THREE.ParticleBasicMaterial({
		size:90,
		map: THREE.ImageUtils.loadTexture("img/soils.png"),
		transparent: true
	});	
var soilSystem = new THREE.ParticleSystem(theSoils,soilMaterial);
soilSystem.sortParticles = true;

function draw_soil(xc,yc,zc, depth) {
	var xd, yd, fac = 1, ran = square/fac
	for (var n = 0; n < depth; n++) {
		xd = -ofx+xc +ran/2-ran*Math.random()
		yd = -ofy+yc +ran/2-ran*Math.random()
		var yol = new THREE.Vector3(xd,zc,yd)
		theSoils.vertices.push(yol);
		}  }
	
function soil_deposits(nx_col,nx_row,slope,enter,exit) {
	var soils = 6, soildepth = 0
	slopex2 = slope.x*slope.x; slopey2 = slope.y*slope.y
	slopevect = Math.pow(slopex2 +slopey2, 0.5)
	difslope = Math.trunc(anteslope -slopevect)
	if (difslope > 0) soildepth = soils*difslope
	avg_x = (exit.x +enter.x)/2; avg_y = (exit.y +enter.y)/2
	xc = square*(nx_col) +avg_x; yc = square*(nx_row) +avg_y 
	zc = (exit.z +enter.z)/2; anteslope = slopevect
	if (alt[nx_row][nx_col] && soildepth) 
		draw_soil(xc,yc,zc*vs, soildepth) }
	
/*_____________________________________________________________________*/

/*                               MAIN								   */
/*_____________________________________________________________________*/

function check_hollow(nx_col,nx_row) {
	var hollow = false
	if ((nx_col == prev_col[0] && nx_row == prev_row[0]) ||
		(nx_col == prev_col[1] && nx_row == prev_row[1]) ||
		(nx_col == prev_col[2] && nx_row == prev_row[2]) ||
		(nx_col == prev_col[3] && nx_row == prev_row[3])) hollow = true
	else { for (var n = 3; n > 0; n--) {
    		prev_col[n] = prev_col[n-1]; prev_row[n] = prev_row[n-1]  }
    	prev_col[0] = nx_col; prev_row[0] = nx_row }
    return hollow }
	
function run_off(col,row) { 
	anteslope = 0; difslope = 0  
	prev_col = [-1,-1,-1,-1], prev_row = [-1,-1,-1,-1]
	var exit = { x: 0, y: 0, z: 0, side: 0 }
	var add = { col: 0, row: 0 }
	var elev = alt[row][col]  //  , soildepth = 0
	var sea = true, shore = false, hollow = false

	get_corners(col,row, sq)
	exit = roll_da_bead(col,row); 
	add = next_cell(exit.side) 
	nx_col = col +add.col; nx_row = row +add.row
	while ( !(hollow) && ( (elev > 0 ) // || shore) 
			&& (0 < nx_col && nx_col < cols-1) 
			&& (0 < nx_row && nx_row < rows-1) ) ) {
		get_corners(nx_col,nx_row, square)
		enter = exit_to_enter(exit, enter)
		slope = slope_comp(nx_col, nx_row) 
		if (isOdd(enter.side)) {
			exit = cross_EW(enter, slope)
		    draw_runoff(col,row, enter,exit) }
		else { exit = cross_NS(enter, slope)
		    draw_runoff(col,row, enter,exit) }
		soil_deposits(nx_col,nx_row,slope,enter,exit)
		add = next_cell(exit.side) 
		nx_col += add.col; nx_row += add.row
		hollow = check_hollow(nx_col,nx_row)
		if (elv[0]+elv[1]+elv[2]+elv[3] && 
			!elv[0]*elv[1]*elv[2]*elv[3]) shore = true
		elev = alt[nx_row][nx_col]  
		} }
	

