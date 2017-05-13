/*__________________________________________________________________________
 
					Square Grid & Base Faces Routines
 ___________________________________________________________________________*/

// Terrain Grid
var baseSquares = new THREE.Object3D();
var edgeSquares = new THREE.Object3D();
// Terrain Base Group (Wires/Faces);
var group;
group = new THREE.Group();
scene.add( group );

/**/
function add_shape( shape, color, x, y, z, rx, ry, rz, s, side ) {
	var points = shape.createPointsGeometry();
	var spacedPoints = shape.createSpacedPointsGeometry( 50 );
	// Faces
	var geometry = new THREE.ShapeGeometry( shape );
	var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: warmgrey, side: side } ) );
	mesh.position.set(x, y, z);
	mesh.rotation.set(rx, ry, rz);
	mesh.scale.set(s, s, s);
	group.add(mesh);
	// Wireframe
	var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: deepblue} ) );
	line.position.set(x, y, z) 
	line.rotation.set(rx, ry, rz)
	line.scale.set( s, s, s)
	group.add(line)
	}

function draw_square(col,row) {  // top n left sides
	if (elv[0] || elv[1]) { colr = litegrey   // land
		if (col == co && (row == ro || row == ro+1)) colr = briteylo
		baseSquares.add(draw_segment(lat[0],adt[0],elv[0], lat[1],adt[1],elv[1], colr)) }
	if (row == 0) {       if (elv[0] || elv[1]) colr = litegrey; else colr = deepblue  
		if (col == co && (row == ro || row == ro+1)) colr = briteylo
		edgeSquares.add(draw_segment(lat[0],adt[0],elv[0], lat[1],adt[1],elv[1], colr)) }
	if (row == rows -1) { if (elv[0] || elv[1]) colr = litegrey; else colr = deepblue  
		if (col == co && row == ro ) colr = briteylo
		edgeSquares.add(draw_segment(lat[2],adt[2],elv[2], lat[3],adt[3],elv[3], colr)) }
	
	if (elv[0] || elv[3]) { colr = litegrey   // land
		if ((col == co || col == co+1) && row == ro) colr = briteylo
		baseSquares.add(draw_segment(lat[0],adt[0],elv[0], lat[3],adt[3],elv[3], colr)) }
	if (col == 0) {      if (elv[0] || elv[3]) colr = litegrey; else colr = deepblue  
		if ((col == co || col == co+1) && row == ro) colr = briteylo
		edgeSquares.add(draw_segment(lat[0],adt[0],elv[0], lat[3],adt[3],elv[3],colr)) }
	if (col == cols -1) { if (elv[0]+elv[1]) colr = litegrey; else colr = deepblue  
		if (col == co && row == ro ) colr = briteylo
		edgeSquares.add(draw_segment(lat[1],adt[1],elv[1], lat[2],adt[2],elv[2], colr)) }
	}

function edge_face(n,face, end) {
	var depth = -60
	var h = 1/vs, zbase = depth*h*vs;
	if (isOdd(face)) { 
		   Py[n] = -ofx+(n*square); 
		   Pz[n] = vs*alt[end][n] }
	else { Py[n] = -ofy+(n*square); 
		   Pz[n] = vs*alt[n][end] }
	}

function end_edge(n, face) {
	var depth = -60, h = 1/vs
	var zbase = depth*h*vs

	if (isOdd(face)) { 
		Py[n+1] = ofx; Pz[n+1] = zbase
	   	Py[n+2] = -ofx; Pz[n+2] = zbase }
	else { Py[n+1] = ofy; Pz[n+1] = zbase
	   	Py[n+2] = -ofy; Pz[n+2] = zbase }
	}

function feed_face(facets, face)  {
	for (var n = 0; n <= facets; n++) 
		if (face == 1) edge_face(n,face, 0)
		else if (face == 3) edge_face(n,face, rows)
		else if (face == 2) edge_face(n,face, cols)
		else edge_face(n,face, 0)
	if (face == 1) end_edge(facets,face) 
	else if (face == 3) end_edge(facets,face) 
	else if (face == 2) end_edge(facets,face) 
	else end_edge(facets,face) 
	}

function draw_bases(){           //Create Base Faces
	var dcols = cols +1

	var firstPoints = []; feed_face(dcols,1)  //N
	for (n = 0; n <= dcols+2; n++) 
		firstPoints.push(new THREE.Vector2(Py[n],Pz[n]));
	var shapeN = new THREE.Shape(firstPoints);	
	add_shape(shapeN, 0xf08000, 0,0,-2*ofy, 0,0,0, 1, THREE.BackSide)
	
	var firstPoints = []; feed_face(dcols,3)  //S
	for (n = 0; n <= dcols+2; n++) 
		firstPoints.push(new THREE.Vector2(Py[n],Pz[n]));
	var shapeS = new THREE.Shape(firstPoints);
	add_shape(shapeS, 0xf08000, 0,0,0, 0,0,0, 1, THREE.FrontSide)
	  
	var firstPoints = []; feed_face(rows,2)  //E 
	for (n = 0; n <= rows+2; n++) 
		firstPoints.push(new THREE.Vector2(Py[n],Pz[n]));
	var shapeE = new THREE.Shape(firstPoints);	
	add_shape(shapeE, 0xf08000, ofx,0,-ofy, 0,-pi/2,0, 1, THREE.BackSide)
	
	var firstPoints = []; feed_face(rows,4)  //W
	for (n = 0; n <= rows+2; n++) { 
		firstPoints.push(new THREE.Vector2(Py[n],Pz[n])) }
	var shapeW = new THREE.Shape(firstPoints)
	add_shape(shapeW, 0xf08000, -ofx,0,-ofy, 0,-pi/2,0, 1, THREE.FrontSide)

	group.position.x = 0; group.position.y = 0; group.position.z = ofy
	}