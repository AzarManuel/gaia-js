/*__________________________________________________________________________
 
					Basic Drawing Routines
 ___________________________________________________________________________*/
/** /Draw Line Segment
function draw_segment(xA,yA,zA, xB,yB,zB, colr) {
	var lineG = new THREE.Geometry();
	var lineMat = new THREE.LineBasicMaterial(
									{color:colr})
	xA = xA-ofx; yA = yA-ofy; zA = vs*zA
	xB = xB-ofx; yB = yB-ofy; zB = vs*zB
	lineG.vertices.push(new THREE.Vector3(xA,zA,yA));
	lineG.vertices.push(new THREE.Vector3(xB,zB,yB));
		
	newLine = new THREE.Line(lineG, lineMat);
	newLine.material.needsUpdate = true;
	return newLine;
	}
/** /
//Triangle Fan Feed
function feed_disc(Sx,Sy, slices,rad)  {
	var alfa = (360/slices)*d2r;
	for (var i = 0; i <= slices; i++) {
		Px[i] = 0; Py[i] = 0; Pz[i] = 0; }
    
    Px[0] = Sx; Py[0] = Sy; Pz[0] = 0;
	for (var i = 1; i <= slices; i++) {
        Px[i] = Sx +rad*Math.cos((i)*alfa); 
		Py[i] = Sy +rad*Math.sin((i)*alfa); 
	    Pz[i] = 0; }
	i = slices +1;
	Px[i] = Px[1]; Py[i] = Py[1]; Pz[i] = Pz[1];
	return Px,Py,Pz;
	}
/** /
function edge_face(n,face, end) {
	var depth = -60;
	var h = 1/vs, zbase = depth*h*vs;
	//if (face % 2) {
	if (isOdd(face)) {
		if(face == 1){ P1y[n] = -ofy+(n*square); P1z[n] = vs*alt[end][n] }
		else{ P3y[n] = -ofy+(n*square); P3z[n] = vs*alt[end][n] }
		//Py[n+1] = ofy; Pz[n+1] = zbase
	   	//Py[n+2] = -ofy; Pz[n+2] = zbase
	    //Py[n+3] = -ofy; Pz[n+3] = Pz[0] 
		}
	else {
		if(face == 2){ P2y[n] =  -ofx+(n*square);P2z[n] = vs*alt[n][end];}
		else{ P4y[n] =  -ofx+(n*square); P4z[n] = vs*alt[n][end]; } 
		//Px[n+1] = ofx; Pz[n+1] = zbase
		//Px[n+2] = -ofx; Pz[n+2] = zbase
		//Px[n+3] = -ofx; Pz[n+3] = Pz[0] 
		}
	}

function end_edge(n,face) {
	var depth = -60//, n = facets+3
	var h = 1/vs, zbase = depth*h*vs;

	if (face == 1) {
		P1y[n+1] = ofx; P1z[n+1] = zbase
	   	P1y[n+2] = -ofx; P1z[n+2] = zbase }
	else if (face == 3) {
		P3y[n+1] = ofx; P3z[n+1] = zbase
	   	P3y[n+2] = -ofx; P3z[n+2] = zbase }
	else if (face == 2) {
		P2y[n+1] = ofy; P2z[n+1] = zbase
	   	P2y[n+2] = -ofy; P2z[n+2] = zbase }
	else if (face == 4) {
		P4y[n+1] = ofy; P4z[n+1] = zbase
	   	P4y[n+2] = -ofy; P4z[n+2] = zbase }
	}
/** /
function edge_face(n,face, end) {
	//var depth = -60, fudge = 0.48*ofy  // csv 4
	//var depth = -60, fudge = 0.23*ofy // csv 3
	//var depth = -60, fudge = 0.28*ofy // csv mochima
	var depth = -60, fudge = 0
	var h = 1/vs, zbase = depth*h*vs;
	if (isOdd(face)) { 
		   Py[n] = -fudge-ofx+(n*square); 
		   Pz[n] = vs*alt[end][n] }
	else { Py[n] =  fudge-ofy+(n*square); 
		   Pz[n] = vs*alt[n][end] }
	}

function end_edge(n,face) {
	var depth = -60//, n = facets+3
	var h = 1/vs, zbase = depth*h*vs;

	if (isOdd(face)) { 
		Py[n+1] = ofx; Pz[n+1] = zbase
	   	Py[n+2] = -ofx; Pz[n+2] = zbase }
	else { Py[n+1] = ofy; Pz[n+1] = zbase
	   	Py[n+2] = -ofy; Pz[n+2] = zbase }
	}

//Triangle Fan Draw
function feed_face(facets,face)  {
	var depth = -60//, n = facets+3
	var h = 1/vs, zbase = depth*h*vs;

	for (var n = 0; n <= facets; n++) { 
		if (face == 1) edge_face(n,face, 0)
		else if (face == 3) edge_face(n,face, rows)
		else if (face == 2) edge_face(n,face, cols)
		else edge_face(n,face, 0)
		}
	if (face == 1) end_edge(facets,face)
		else if (face == 3) end_edge(facets,face)
		else if (face == 2) end_edge(facets,face)
		else end_edge(facets,face)
	}
/** /
function fill_poly(Px,Py,Pz, colr,face) { 
       var slices = Px.length-1
       var vectCount = 0

       var mat = new THREE.MeshBasicMaterial({color:colr})
       var geom = new THREE.Geometry()

       for (var i = 0; i < slices; i++) {
   		   var v0 = new THREE.Vector3(Py[0],Pz[0],Px[0])
	       var v1 = new THREE.Vector3(Py[i],Pz[i],Px[i])
	       var v2 = new THREE.Vector3(Py[i+1],Pz[i+1],Px[i+1]) 
	       
	       geom.vertices.push(v0); geom.vertices.push(v1); geom.vertices.push(v2)
		   geom.faces.push( new THREE.Face3(vectCount, vectCount+1, vectCount+2))
		   geom.computeFaceNormals()
	       vectCount += 3 }
	    
	    var mesh = new THREE.Mesh(geom,mat)
	    return mesh }
	/**/
	  
    