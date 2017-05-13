/*__________________________________________________________________________

 Draw the Solar diagram
 ___________________________________________________________________________*/

// Diagram Scale	
var dscal = 9, nscal = 0.36 * dscal;

//Main Object
var solarDiag = new THREE.Object3D();

//Children
var diagCircle = new THREE.Object3D();
var diagNorth = new THREE.Object3D();
var diagCross = new THREE.Object3D();
var diagMonths = new THREE.Object3D();
var diagHours = new THREE.Object3D();

//Draw Line Segment
function draw_segment(xA, yA, zA, xB, yB, zB, colr) {
    var lineG = new THREE.Geometry();
    var lineMat = new THREE.LineBasicMaterial(
        {color: colr})
    xA = xA - ofx;
    yA = yA - ofy;
    zA = vs * zA
    xB = xB - ofx;
    yB = yB - ofy;
    zB = vs * zB
    lineG.vertices.push(new THREE.Vector3(xA, zA, yA));
    lineG.vertices.push(new THREE.Vector3(xB, zB, yB));

    newLine = new THREE.Line(lineG, lineMat);
    newLine.material.needsUpdate = true;
    return newLine;
}

function fill_poly(Px, Py, Pz, colr, face) {
    var slices = Px.length - 1
    var vectCount = 0

    var mat = new THREE.MeshBasicMaterial({color: colr})
    var geom = new THREE.Geometry()

    for (var i = 0; i < slices; i++) {
        var v0 = new THREE.Vector3(Py[0], Pz[0], Px[0])
        var v1 = new THREE.Vector3(Py[i], Pz[i], Px[i])
        var v2 = new THREE.Vector3(Py[i + 1], Pz[i + 1], Px[i + 1])

        geom.vertices.push(v0);
        geom.vertices.push(v1);
        geom.vertices.push(v2)
        geom.faces.push(new THREE.Face3(vectCount, vectCount + 1, vectCount + 2))
        geom.computeFaceNormals()
        vectCount += 3
    }

    var mesh = new THREE.Mesh(geom, mat)
    return mesh
}

function draw_circle(dCx, dCy, dCz, rad) {
    var colr = aplgreen;
    step = 10
    xAnt = dCx + rad;
    yAnt = dCy;
    zC = dCz
    for (i = 0; i <= 360; i += step) {
        xC = dCx + rad * Math.cos(i * d2r);
        yC = dCy + rad * Math.sin(i * d2r)
        diagCircle.add(draw_segment(xAnt, yAnt, zC, xC, yC, zC, colr))
        xAnt = xC;
        yAnt = yC
    }
    return diagCircle
}

function draw_cross(dDx, dDy, dDz, rad, tip) {
    arm = rad + tip
    diagCross.add(draw_segment(dDx + arm, dDy, zC, dDx - arm, dDy, zC, aplgreen))
    diagCross.add(draw_segment(dDx, dDy + arm, zC, dDx, dDy - arm, zC, aplgreen))
    return diagCross
}

function draw_north(Cx, Cy, ns) {
    nw = 4 * ns;
    nh = 3 * ns;
    ny = Cy - 36 * ns
    nx = Cx;
    fy = nh + 3 * ns;
    gy = nh + 6 * ns

    var nax = nx - nw, nay = ny + nh, naz = 0
    var nbx = nx - nw, nby = ny - nh, nbz = 0
    var ncx = nx + nw, ncy = ny + nh, ncz = 0
    var ndx = nx + nw, ndy = ny - nh, ndz = 0

    var nex = nx - nw, ney = ny - fy, nez = 0
    var nfx = nx, nfy = ny - gy, nfz = 0
    var ngx = nx + nw, ngy = ny - fy, ngz = 0

    diagNorth.add(draw_segment(nax, nay, naz, nbx, nby, nbz, darkgrey))
    diagNorth.add(draw_segment(nbx, nby, nbz, ncx, ncy, ncz, darkgrey))
    diagNorth.add(draw_segment(ncx, ncy, ncz, ndx, ndy, ndz, darkgrey))
    diagNorth.add(draw_segment(nex, ney, nez, nfx, nfy, nfz, darkgrey))
    diagNorth.add(draw_segment(nfx, nfy, nfz, ngx, ngy, ngz, darkgrey))
    return diagNorth
}

/** /function label_diagram(Lx,Ly) {
	cTx = -600; cTy = -600; cTz = 0    // center cross
	mTy = cTy -120  		  		   // fore shift labels
	dTx_am = cTx +45; dTx_pm = cTx -75 // right and left labels
	//draw_text(Lx+cTx,   Ly+cTy,cTz,'+')
	//draw_text(Lx+dTx_am,Ly+mTy,cTz,'am')
	//draw_text(Lx+dTx_pm,Ly+mTy,cTz,'pm')
	}/**/

function draw_months(dDx, dDy, dscal) {
    colr = aplgreen;
    zC = 0;
    for (var m = 1; m <= 6; m++) {
        var mondawn = jundawn + difdawn * (6 - m) / 6,
        sunrise = mondawn * 4,
        sunset = 96 - sunrise;
        console.log('month n', m, 'jundawn:', jundawn, 'difdawn', difdawn, ' mondawn:', mondawn, ' sunrise: ', sunrise, 'sunset: ', sunset);
        for (var qhr = sunrise; qhr <= sunset; qhr++) {
            console.log('quarter hour', qhr);
            sunpos = sun_pos(m, 1, qhr / 4, 0, 0);
            console.log('sun pos', sunpos);

            track_x = dDx + .42 * dscal * sunpos[0];
            track_y = dDy - .42 * dscal * sunpos[1];

            if (qhr == sunrise) {
                xant = track_x;
                yant = track_y
            }
            diagMonths.add(draw_segment(xant, yant, zC, track_x, track_y, zC, colr));
            xant = track_x;
            yant = track_y
        }
    }
    return diagMonths
}

function draw_hours(dDx, dDy, dscal) {
    colr = aplgreen;
    for (hr = 0; hr <= 24; hr++) {
        for (var wk = 0; wk <= 24; wk++) {
            m = wk / 4
            mondawn = jundawn + difdawn * (6 - m) / 6
            sunrise = mondawn;
            sunset = 24 - sunrise;
            sunpos = sun_pos(m, 1, hr, 0, 0)
            track_x = dDx + .42 * dscal * sunpos[0]
            track_y = dDy - .42 * dscal * sunpos[1]
            if (wk == 0) {
                xant = track_x;
                yant = track_y
            }
            if (sunrise < hr && hr < sunset) {
                diagHours.add(draw_segment(xant, yant, zC,
                    track_x, track_y, zC, colr))
            }
            xant = track_x;
            yant = track_y
        }
    }
    return diagHours
}

function draw_diagram(dDx, dDy) {
    var rad = dscal * 16.5, tip = dscal * 3;
    solarDiag.add(draw_circle(dDx, dDy, 0, rad, 10));
    solarDiag.add(draw_months(dDx, dDy, 1.1 * dscal));
    solarDiag.add(draw_hours(dDx, dDy, 1.1 * dscal));
    solarDiag.add(draw_north(dDx, dDy, nscal));
    //label_diagram(dDx,dDy)
    solarDiag.add(draw_cross(dDx, dDy, 0, rad, tip));
    return solarDiag
}

/** /
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

 //Triangle Fan Feed
 function feed_disc(Sx,Sy, slices,rad)  {
	var alfa = (360/slices)*d2r;
	for (var i = 0; i <= slices; i++) {
		Px[i] = 0; Py[i] = 0; Pz[i] = 0; }
    
    //Px[0] = Sx; Py[0] = Sy; Pz[0] = 0;
	for (var i = 0; i < slices; i++) {
        Px[i] = Sx +rad*Math.cos((i)*alfa); 
		Py[i] = Sy +rad*Math.sin((i)*alfa); 
	    Pz[i] = 0; }
	i = slices;
	Px[i] = Px[0]; Py[i] = Py[0]; Pz[i] = Pz[0];
	return Px,Py,Pz }

 var firstPoints = []    // ; feed_face(cols,1)  //N
 for (n = 0; n <= slices; n++)
 firstPoints.push(new THREE.Vector2(Py[n],Pz[n]));
 var shapeN = new THREE.Shape(firstPoints);
 add_shape(shapeN, 0xf08000, 0,0,-2*ofy, 0,0,0, 1, THREE.BackSide)
 /**/

//Triangle Fan Feed
function feed_disc(Sx, Sy, slices, rad) {
    var alfa = (360 / slices) * d2r;
    for (var i = 0; i <= slices; i++) {
        Px[i] = 0;
        Py[i] = 0;
        Pz[i] = 0;
    }

    Px[0] = Sx;
    Py[0] = Sy;
    Pz[0] = 0;
    for (var i = 1; i <= slices; i++) {
        Px[i] = Sx + rad * Math.cos((i) * alfa);
        Py[i] = Sy + rad * Math.sin((i) * alfa);
        Pz[i] = 0;
    }
    i = slices + 1;
    Px[i] = Px[1];
    Py[i] = Py[1];
    Pz[i] = Pz[1];
    return Px, Py, Pz;
}

// Create Solar diag Sun  
var slices = 9, radius = 15
Px, Py, Pz = feed_disc(-375, 840, slices, radius);
var sol = fill_poly(Px, Py, Pz, briteylo, 0);


