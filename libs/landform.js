/*__________________________________________________________________________
 
						Landform Drawing Routines
 ___________________________________________________________________________*/
 
var landMaterial = new THREE.MeshLambertMaterial(
	{color: olvgreen});
var landGeometry = new THREE.Geometry();
landGeometry.name = "landGeometry";
var landMesh = new THREE.Mesh(landGeometry, landMaterial)
var waterMaterial = new THREE.MeshBasicMaterial(
	{color: deepblue})
var waterGeometry = new THREE.Geometry();
waterGeometry.name = "waterGeometry";
var waterMesh = new THREE.Mesh(waterGeometry, waterMaterial)

function get_corners(col,row,square) { // corner coordinates 
	lat[0] = (col+0)*square; lat[1] = (col+1)*square
	lat[2] = (col+1)*square; lat[3] = (col+0)*square
	
	adt[0] = (row+0)*square; adt[1] = (row+0)*square
	adt[2] = (row+1)*square; adt[3] = (row+1)*square
	
	elv[0] = alt[row+0][col+0]; elv[1] = alt[row+0][col+1]
	elv[2] = alt[row+1][col+1]; elv[3] = alt[row+1][col+0]
	}

function land_triangle(c1,c2,c3) {
	var v0 = new THREE.Vector3(lat[c1]-ofx,vs*elv[c1],adt[c1]-ofy)
	var v1 = new THREE.Vector3(lat[c2]-ofx,vs*elv[c2],adt[c2]-ofy)
	var v2 = new THREE.Vector3(lat[c3]-ofx,vs*elv[c3],adt[c3]-ofy)
	landGeometry.vertices.push(v0);
	landGeometry.vertices.push(v1);
	landGeometry.vertices.push(v2);
	landGeometry.faces.push(
				  new THREE.Face3(dryVert+2,dryVert+1,dryVert))
	dryVert += 3  
	}

function water_triangle(c1,c2,c3) {
	var v0 = new THREE.Vector3(lat[c1]-ofx,elv[c1],adt[c1]-ofy)
	var v1 = new THREE.Vector3(lat[c2]-ofx,elv[c2],adt[c2]-ofy)
	var v2 = new THREE.Vector3(lat[c3]-ofx,elv[c3],adt[c3]-ofy)
	waterGeometry.vertices.push(v0);
	waterGeometry.vertices.push(v1);
	waterGeometry.vertices.push(v2);
	waterGeometry.faces.push(
				  new THREE.Face3(wetVert+2,wetVert+1,wetVert))
	wetVert += 3 
	}

/** /function draw_triangle(c1,c2,c3,geom) {
	var v0 = new THREE.Vector3(lat[c1]-ofx,elv[c1],adt[c1]-ofy)
	var v1 = new THREE.Vector3(lat[c2]-ofx,elv[c2],adt[c2]-ofy)
	var v2 = new THREE.Vector3(lat[c3]-ofx,elv[c3],adt[c3]-ofy)
	geom.vertices.push(v0);
	geom.vertices.push(v1);
	geom.vertices.push(v2);
	if(geom.name == "waterGeometry"){
		geom.faces.push(
				  new THREE.Face3(wetVert+2,wetVert+1,wetVert))
		wetVert += 3 
	}
	else if(geom.name == "landGeometry"){
		geom.faces.push(
					  new THREE.Face3(dryVert+2,dryVert+1,dryVert))
		dryVert += 3 	
	}
}/**/

function fill_wetordry(v0,v1,v2, dry) {
	if (dry) { landGeometry.vertices.push(v0)
			landGeometry.vertices.push(v1)
			landGeometry.vertices.push(v2)
			landGeometry.faces.push(
				new THREE.Face3(dryVert+2,dryVert+1,dryVert))
			dryVert += 3  }
	else  { waterGeometry.vertices.push(v0)
			waterGeometry.vertices.push(v1)
			waterGeometry.vertices.push(v2)
			waterGeometry.faces.push(
				new THREE.Face3(wetVert+2,wetVert+1,wetVert))
			wetVert += 3  }
	}
	
function fill_triang(xa,ya,za, xb,yb,zb, xc,yc,zc) {
	var v0 = new THREE.Vector3(xa-ofx, vs*za, ya-ofy)
	var v1 = new THREE.Vector3(xb-ofx, vs*zb, yb-ofy)
	var v2 = new THREE.Vector3(xc-ofx, vs*zc, yc-ofy)
	if (za+zb+zc) dry = true; else dry = false; 
	fill_wetordry(v0,v1,v2, dry)
	}

function avg(a,b) {
	average = (a + b)/2
	return average
	}

function avg4(a,b,c,d) {
	var average = (a+b+c+d)/4
	return average
	}

function kaleido_fill(i, row,col) {
	if (i == 1 || i == 3) {              // in case of 1st or 3rd quarters
		 if ((i == 1 && row > 0 && col < cols)  // if not at rear or right  
				|| (i == 3 && col > 0 && row < rows)) { // or left or fore
			fill_triang(x3,y3,z3, x1,y1,z1, x0,y0,z0)  // draw inset areas
			fill_triang(x3,y3,z3, x2,y2,z2, x1,y1,z1) } } // draw out sets 
	else if ((i == 2 && col < cols && row < rows) // else if no fore right
				|| (i == 4 && col > 0 && row > 0)) {    // or rear or left
			fill_triang(x0,y0,z0, x1,y1,z1, x3,y3,z3)  // draw inset areas
			fill_triang(x1,y1,z1, x2,y2,z2, x3,y3,z3) } // draw outer sets
			}
	
function fill_quarters(col,row, sqr) { 
	var Vz0, Vz1, Vz2, Vz3;       // the height of each adjacent grid cell
	for (var i = 1; i <= 4; i++) {  // draw each quarter if not on an edge
		x0 = sqr*col; y0 = sqr*row; z0 = alt[row][col] // the center point
		if (i == 1 || i == 2) dx = 1; else dx = -1 // give or take one row
		// neutralize xshift if first or last row in left or right sectors
		if ((col==0 &&!((i-3)*(i-4)))||(col==cols &&!((i-1)*(i-2)))) dx=0;
		if (i == 2 || i == 3) dy = 1; else dy = -1 // give or take one col
		// neutralize yshift if first or last col in rear or front sectors
		if ((row==0 &&!((i-1)*(i-4)))||(row==rows &&!((i-2)*(i-3)))) dy=0;
		// Now check the Vzs  for some nil  but not all,  if so don't draw
		Vz0 = alt[row][col]; Vz1 = alt[row][col+dx]; // org n hoz adjacent
		Vz2 = alt[row+dy][col+dx]; Vz3 = alt[row+dy][col]; // vert an diag
		if ((Vz0*Vz1*Vz2*Vz3) || (!(Vz0+Vz1+Vz2+Vz3))) { //all wet all dry
			x1 = avg(x0, sqr*(col+dx)); y1 = y0; z1 = avg(z0, alt[row][col+dx])
			x3 = x0; y3 = avg(y0, sqr*(row+dy)); z3 = avg(z0, alt[row+dy][col])
			x2 = x1; y2 = y3; // x,y,z vals parametrized with +1,-1 for dx, dy.
			z2 = avg4(z0,alt[row][col+dx],alt[row+dy][col+dx],alt[row+dy][col]) 
			kaleido_fill(i, row,col) // draw inside and outside triangs allround
			}
		} }   