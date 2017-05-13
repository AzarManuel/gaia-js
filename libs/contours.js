/*__________________________________________________________________________

					Contour curves
 ___________________________________________________________________________*/

var baseContours = new THREE.Object3D();
var baseShore = new THREE.Object3D();
 
function get_coord(level,origin,h1,h2) {  // intersect side  
	if (h1 == h2) edge_shift = 0 // calc distance to origin
	else   edge_shift = Math.abs(square*(level-h1)/(h2-h1))
	return origin +edge_shift }

function end_coordinates(level,side) { // set intersct coord
	if      (side == 0) { lat_edge = lat[0];    // west edge
		 adt_edge = get_coord(level, adt[0],elv[0],elv[3]) }
	else if (side == 1) { adt_edge = adt[1];   // north edge
		 lat_edge = get_coord(level, lat[0],elv[0],elv[1]) }
	else if (side == 2) { lat_edge = lat[2];    // east edge
		 adt_edge = get_coord(level, adt[1],elv[1],elv[2]) }
	else if (side == 3) { adt_edge = adt[3];   // south edge
		 lat_edge = get_coord(level, lat[3],elv[3],elv[2]) }
	return [lat_edge, adt_edge] }
	
function draw_contour(col,row, level, above,below) {
	var x_in, y_in, x_out,y_out  // determine entry and exit points
	var ofx = 0,ofy = 0, shore = 0.5, vsep = 21
	vsep = 1; lvl = level +vsep // variable declaratn an initl vals
	endcoord = end_coordinates(level,above)  // set enter coordints
	x_in = endcoord[0] -ofx; y_in = endcoord[1] -ofy
	endcoord = end_coordinates(level,below)  // calc exit coordints
	x_out = endcoord[0] -ofx; y_out = endcoord[1] -ofy
	if (level == shore && above >= 0) { c = srfwhite; //lvl = 1  // if surf
		lat[4] = x_in; adt[4] = y_in; elv[4] = level   // assign in
		lat[5] = x_out; adt[5] = y_out; elv[5] = level // assgn out
		baseShore.add(draw_segment(x_in,y_in,lvl, x_out,y_out,lvl, c)) }
	else if (level % 50) { colr = curvlite  // minor contour values
		return draw_segment(x_in,y_in,lvl, x_out,y_out,lvl, colr) }
	else { colr = curvdark     // major contour values, darker line
		return draw_segment(x_in,y_in,lvl, x_out,y_out,lvl, colr) }
	}

function fill_shoreline(col,row,above,below,elv) {
	// to paint sea's edge green then blue, draw 1 to 3 triangles
	// deprt and retrn points are indexed 4 n 5; other points 0-3
	// a, b n c are the array indexes for the intermediary points.

	var a = above, b = (above+1)%4, c = (above+2)%4 //set corners
	land_triangle(4,a,5,elv);     // draw first triangle on land side
	if (below == (above +2)%4) land_triangle(a,b,5,elv)   // draw 2nd
	if (below == (above +3)%4) { // if necessary draw 2nd and 3rd
		land_triangle(a,b,5,elv); land_triangle(5,b,c,elv) } 

	a = (above+3)%4; b = (above+2)%4; c = (above+1)%4  // corners
    water_triangle(4,5,a)      // draw first triangle on sea side
	if (above == (below +2)%4) water_triangle(a,5,b)  // draw 2nd
	if (above == (below +3)%4) { // if necessary draw 2nd and 3rd
    	water_triangle(a,5,b); water_triangle(b,5,c) } 
	} 

function check_contours(col,row, elv) {
	var shore = 0.5
	for (levl = altmin; levl <= altmax; levl+= curvint) {
		if (levl == 0) level = shore; else level = levl;                   
		prestart = false;  above = -1; below = -1;  nps = -1
		for (n = 0; n <= 7; n++) { point = n%4; // go around
			if (elv[n] < level) { prestart = true; // if nil
				if (nps < 0) nps = n }   // nps is prestart#
			if (prestart && above < 0 && elv[point] > level) 
				{ above = point; n++; point = n%4 } // above
		    if (above >= 0 && elv[point] < level) { // below
		    	below = point; break } }  // assign and exit
		if (above >= 0 && below >= 0) { //} && levl == 0) { //curve
			var newContour = draw_contour(col,row, level, above,point);      
			if (newContour) baseContours.add(newContour) } 
		if (level == shore && above >= 0) {
			fill_shoreline(col,row,above,below,elv) // shore 
		}   }  }

	
	

