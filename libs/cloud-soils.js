/*__________________________________________________________________________
 
					Contacts Routines
 ___________________________________________________________________________*/

/** /
var clouds = new THREE.Geometry(),
	cloudMaterial = new THREE.ParticleBasicMaterial({
		size:120	,
		map: THREE.ImageUtils.loadTexture("img/cloud.png"),
		transparent: true
		})

var cloudSystem = new THREE.ParticleSystem(clouds,cloudMaterial);
cloudSystem.sortParticles = true;

function draw_cloud(col,row, contact) {
	var xc,yc,zc, xd,yd,zd
	var contact = 30, contract = square*1.2
	for (var n = 0; n <= contact; n++) {
		xd = contract*(0.5-Math.random()); xc = (col+0.5)*square +xd, 
        yd = contract*(0.5-Math.random()); yc = (row+0.5)*square +yd, 
        zd = contract*(Math.random()); zc = alt[row][col] -zd
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
		}
	}
	scene.add(cloudSystem);
}
/**/
/*__________________________________________________________________________
 
					Soils Routines
 ___________________________________________________________________________*/

/** /
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
		xd = xc +ran/2 -ran*Math.random()
		yd = yc +ran/2 -ran*Math.random()
		var yol = new THREE.Vector3(xd-ofx,zc,yd-ofy);
		theSoils.vertices.push(yol);
		}  }
		/**/
	
