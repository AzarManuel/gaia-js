/*__________________________________________________________________________
 
						Exposure Drawing Routines
 ___________________________________________________________________________*/

var baseExposure = new THREE.Object3D();

function center_side(xs,ys) {
	var exit_side = 0
	absex = Math.abs(xs); absye = Math.abs(ys)
	if (ys < 0 && absex < absye) exit_side = 0
	if (xs > 0 && absex > absye) exit_side = 1
	if (ys > 0 && absex < absye) exit_side = 2
	if (xs < 0 && absex > absye) exit_side = 3
	return exit_side }

function center_comp() {
	xo = lat[0]+square/2; yo = adt[0]+square/2     // centr pt  
	zo = avg4(elv[0],elv[1], elv[2],elv[3]) }   // center elev

function slope_comp(col,row) {
	var slope = { x: 0, y: 0, z: 0 }
    slope.x = -avg(elv[1]-elv[0], elv[2]-elv[3]) 	 // slope x_val
	slope.y = -avg(elv[3]-elv[0], elv[2]-elv[1]) 	 // slope y_val
	slope.z = -(slope.x*slope.x +slope.y*slope.y)/square // slope z
	return slope }

function draw_head(col,row, xs,ys, xp,yp,zp, colr) {
	var qhd = 6, lnhd = square/qhd, pi = 3.1416
	var xb,yb, xg,yg, xc,yc,zc, alfa,beta,gama
	var sqrt2 = 2.1416, lenshaft = lnhd*sqrt2/2
	if (ys) alfa = Math.atan(xs/ys)
	else alfa = pi*(0.5*sign_of(xs)) //}
	if (ys < 0) alfa += pi
	beta = alfa -(pi/4); gama = alfa +(pi/4)
	xb = lnhd*Math.sin(beta); yb = lnhd*Math.cos(beta)
	xg = lnhd*Math.sin(gama); yg = lnhd*Math.cos(gama)
	ls = Math.pow((xs*xs+ys*ys), 0.5); zs = lenshaft*(ls/sq)
	xc = xp -xb; yc = yp -yb; zc = zp +zs
	baseExposure.add(draw_segment(xp,yp,zp, xc,yc,zc, colr))
	xc = xp -xg; yc = yp -yg; zc = zp +zs
	baseExposure.add(draw_segment(xp,yp,zp, xc,yc,zc, colr))
	}	

function draw_drain(col,row, mode) {   // find center, draw slope
	var colr = deepblue, xp,yp,zp, xf,yf,zf
	var exit  = { x: 0, y: 0, z: 0, side: 0 }
	center_comp(); slope = slope_comp(col, row) 
	if (slope.x || slope.y)  { 
		xf = slope.x; yf = slope.y; zf = slope.z
	    xp = xo +xf; yp = yo +yf; zp = zo +zf 
	    baseExposure.add(draw_segment(xo,yo,zo, xp,yp,zp, colr)) } 
	if (mode <=1 ) 
		draw_head(col,row, slope.x,slope.y, xp,yp,zp, colr) 
	return exit } 

var clouds = new THREE.Geometry(),
	cloudMaterial = new THREE.ParticleBasicMaterial( { size: 120,
		map: THREE.ImageUtils.loadTexture("img/cloud.png"),
		transparent: true } )

var cloudSystem = new THREE.ParticleSystem(clouds,cloudMaterial)
cloudSystem.sortParticles = true;

function draw_cloud(col,row, contact) {
	var xc,yc,zc, xd,yd,zd
	var contact = 30, size = square*1.2
	for (var n = 0; n <= contact; n++) {
		xd = size*(0.5-Math.random()); xc = (col+0.5)*square +xd, 
        yd = size*(0.5-Math.random()); yc = (row+0.5)*square +yd, 
        zd = size*(Math.random()); zc = alt[row][col] -zd
		var cloud = new THREE.Vector3(xc-ofx,zc*vs,yc-ofy)
        clouds.vertices.push(cloud) }
    }

function redrawClouds(rows,cols){
	scene.remove(cloudSystem);
	clouds = null;
	cloudSystem = null;
	clouds = new THREE.Geometry();
	cloudSystem = new THREE.ParticleSystem(clouds,cloudMaterial);
	cloudSystem.sortParticles = true;
	for (var row = 0; row < rows; row++) { 
		for (var col = 0; col < cols; col++) {
			get_corners(col,row, square);
			slope = slope_comp(col,row);
			calc_exposure(col,row,slope,wind);
			}  }
	scene.add(cloudSystem);
	}

function calc_exposure(col,row, slope,wind) {
	var contact = 0 
	var winds = { x : 0, y : 0 }
	var windir = (wind)*d2r

	sloplen = Math.pow(slope.x*slope.x+slope.y*slope.y,0.5)
	slopdir = pi/2; add = 0; if (slope.x < 0) add = -pi	
	if (slope.x) slopdir = Math.atan(slope.y/slope.x) +add
	slopdir = (slopdir +2.5*pi) % (2*pi); slop = slopdir*r2d  
	expoang = Math.abs(windir -slopdir); exang = expoang*r2d  
	expocontact = pi/2 -expoang; expocont = expocontact*r2d
	contact = Math.trunc(sloplen*expocontact)
	/** /if ( row == ro && col == co ) { }   
		 console.log(" in runoff row ", row, " col ", col) 
		 console.log(" slope x ", slope.x, " slope y ", slope.y)
		 console.log(" slope dir ", slop.toFixed(2), " wind dir ", wind.toFixed(2))
		 console.log(" expo ang ", exang.toFixed(2), " expo con ", expocont.toFixed(2)) } /**/
	if (contact > 0) draw_cloud(col,row,contact)
	}

function roll_da_bead(col,row) {   
	var exit  = { x: 0, y: 0, z: 0, side: 0 }
	elev = alt[row][col]; nx_col = col; nx_row = row
	if ( elev > 0 && (0 < nx_col && nx_col < cols-1) 
		   		  && (0 < nx_row && nx_row < rows-1))  {
		get_corners(nx_col,nx_row, square)
		slope = slope_comp(col,row); add_col = 0; add_row = 0
		if (slope.y == 0) { add_col = sign_of(slope.x) }
		else { qdir = Math.abs(slope.x/slope.y) 
			 if (qdir <= 1.25) add_row = sign_of(slope.y) 
			 if (qdir >= 0.8) add_col = sign_of(slope.x) }
		nx_col = nx_col +add_col; nx_row = nx_row +add_row
	    exit = draw_drain(nx_col,nx_row,0) 
		exit.side = center_side(slope.x,slope.y)
		elev = alt[nx_row][nx_col] }  //; cunt-- }
	calc_exposure(col,row, slope,wind)
	return exit 
	}
 
