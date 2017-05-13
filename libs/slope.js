/*__________________________________________________________________________
 
					Slopes Drawing Routines
 ___________________________________________________________________________*/
 

var slopeVert = 0;// vertex Count

//slope Class Mesh
var slopeGeometry = new THREE.Geometry();
var slopeMaterial =  new THREE.MeshLambertMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } );
var slopeMesh = new THREE.Mesh(slopeGeometry, slopeMaterial);

var darkgreen = new THREE.Color(0x225511)
var medmgreen = new THREE.Color(0x446611)
var orangreen = new THREE.Color(0x887711)
var medorange = new THREE.Color(0xbb7711)
var litorange = new THREE.Color(0xee7711)

function calc_slope(dx,dy, row,col, sqr) {
	var Sx,Sy,Sz, Sl, slope = 0;    
		Sx = alt[row][col+dx]-alt[row][col]
		Sy = alt[row+dy][col]-alt[row][col]
    	Sl = Math.pow(Sx*Sx+Sy*Sy, 0.5)
    	slope = 100*Sl/sqr 
    return slope
    }

function set_colour(row,slope) {
	var colour;
	var colname = " "
	if (slope < 20) colour = litorange
	else if (slope < 40) colour = medorange
	else if (slope < 60) colour = orangreen
	else if (slope < 80) colour = medmgreen
	else colour = darkgreen
    return colour
	}

function check_bounds(i, col,row) {
	var inbounds = true
	if ((col == 0)    && ((i == 3)||(i == 4))) inbounds = false
	else if ((col == cols) && ((i == 1)||(i == 2))) inbounds = false
	else if ((row == 0)    && ((i == 1)||(i == 4))) inbounds = false
	else if ((row == rows) && ((i == 2)||(i == 3))) inbounds = false
	return inbounds
	}

function fill_slope(v0,v1,v2, colr) {
	var newFace = new THREE.Face3(slopeVert+2,slopeVert+1,slopeVert);

	slopeGeometry.vertices.push(v0)
	slopeGeometry.vertices.push(v1)
	slopeGeometry.vertices.push(v2)

	newFace.color = colr

	slopeGeometry.faces.push(newFace);
	slopeVert += 3
	}
	
function feed_slope(xa,ya,za, xb,yb,zb, xc,yc,zc, colr) {
	var v0 = new THREE.Vector3(xa-ofx, vs*za, ya-ofy)
	var v1 = new THREE.Vector3(xb-ofx, vs*zb, yb-ofy)
	var v2 = new THREE.Vector3(xc-ofx, vs*zc, yc-ofy)
	// if (za+zb+zc > 6) dry = true; else dry = false
	fill_slope(v0,v1,v2, colr)
	}
/**/
function do_da_slope(i, row,col,color) {
	if (z0*z1*z2*z3) {
	if (i == 1 || i == 3) {                   // in case of 1st or 3rd quarters
		if ( (i == 1 && row > 0 && col < cols)       // if not at rear or right  
				|| (i == 3 && col > 0 && row < rows)) {      // or left or fore
			feed_slope(x3,y3,z3, x1,y1,z1, x0,y0,z0,color)  // draw inner areas
			feed_slope(x3,y3,z3, x2,y2,z2, x1,y1,z1,color)  // draw outer areas 
			 } }
	else if ((i == 2 && col < cols && row < rows)      // else if no fore right
				|| (i == 4 && col > 0 && row > 0)) {         // or rear or left
			feed_slope(x0,y0,z0, x1,y1,z1, x3,y3,z3,color)  // draw inner areas
			feed_slope(x1,y1,z1, x2,y2,z2, x3,y3,z3,color)  // draw outer areas
		}   }
	}   
	
function slope_quarters(col,row, sqr) { // slope_quarters
	// var briteylo = new THREE.Color(0x00ff00); 
	for (var i = 1; i <= 4; i++) {      // draw each quarter if not on an edge
		var inbounds = check_bounds(i, col,row) // check whether row, col are inside
		if (inbounds) {          // if so calculate quarter slope and draw rectangle
			x0 = sqr*col; y0 = sqr*row; z0 = alt[row][col] // the center point
			if (i == 1 || i == 2) dx = 1; else dx = -1 // give or take one row
			if (i == 2 || i == 3) dy = 1; else dy = -1 // give or take one col
			x1 = avg(x0, sqr*(col+dx)); y1 = y0; z1 = avg(z0,alt[row][col+dx])
			x3 = x0; y3 = avg(y0, sqr*(row+dy)); z3 = avg(z0,alt[row+dy][col])
			x2 = x1; y2 = y3; // x,y,z vals parametrized with +1,-1 for dx, dy.
			z2 =avg4(z0,alt[row][col+dx],alt[row+dy][col+dx],alt[row+dy][col]) 
		    slope = calc_slope(dx,dy, row,col, sqr); color = set_colour(row,slope) 
			do_da_slope(i, row,col,color)   //} // draw inside and outside triangles 
			}
		} } 
/**/
