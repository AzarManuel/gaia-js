/*__________________________________________________________________________
 
					Determine the position of the sun
 ___________________________________________________________________________*/
 

function sign_of(num) {
	if (num == 0) { sign = 1 }
	else { sign = num/Math.abs(num) }
	return sign
	}
	
function sunalt(mo, day,hour, L, D) {   	
    hrang = (hour -12)*15 +0.01;     			// angular hour
    H = d2r*(hrang); cosH = Math.cos(H);		// cosH = cos(H);
    sinD = Math.sin(D); cosD = Math.cos(D);		// declination factor
	sinL = Math.sin(L); cosL = Math.cos(L); 	// latitude factor
    
	sinelev = cosL*cosD*cosH +sinL*sinD;    	// principal formula
    if (sinelev < 0) { abovehoz = false } 		// sinelev = 0
    else { abovehoz = true }          			// light hits landform
    return r2d*Math.asin(sinelev)          		
	}
     
function sunazm(hour, suny, L, D) {   		
    A = d2r*(suny);  sinD = Math.sin(D) 		// azimuth and declination
	sinA = Math.sin(A); cosA = Math.cos(A)  	// main formula more readable
	sinL = Math.sin(L); cosL = Math.cos(L)  	// L is a latitude coefficient
    
	cosazm = (sinA*sinL -sinD)/(cosA*cosL)  	// principal formula
    Az = r2d*Math.acos(cosazm)      			// get angle from cosine
	ampm = sign_of(hour -12) 					// right or left side
    return (180 +ampm*Az)     					//  Math.acos(cosazm)
	}
	
function sun_pos(mon,day, hour,mnt) {  		
	var sund = 36, avgMo = 30.364; 
	N =(mon-1)*avgMo+day; hour =hour+mnt/60     // approx day of the year
	declin = 23.45*Math.sin(d2r*(284 +N))   	// declination factor
    L = d2r*(latitude);  D = d2r*(declin)    	// angular conversion
    
	elevation = sunalt(mon,day, hour, L,D)   	// go figure elevtn
    direction = sunazm(hour,elevation,L,D)   	// go figure dirctn
	
	sunp = sund*Math.cos(d2r*(elevation))   	// hoz proj of sun vector 
    sunx = sunp*Math.sin(d2r*(direction))   	// x of sun proj on plane
    suny = sunp*Math.cos(d2r*(direction))   	// y of sun proj on plane
    sunz = sund*Math.sin(d2r*(elevation))   	// vrt proj of sun vector
	return [sunx, suny, sunz]
	}

/*__________________________________________________________________________
 
					Sunlight Routines
 ___________________________________________________________________________*/
 

function sunlight_pos(mon,day, hour,min) {
	sunpos = sun_pos(mon,day, hour,min)
	var sund = 100; sunx = sund*sunpos[0]
	suny = sund*sunpos[1]; sunz = sund*sunpos[2]
	sunLight.position.set(sunx,sunz,-suny).normalize()
	}


function place_sun(mon,day, hour,min) {
	var sunpos_x = 0, sunpos_y = 0, sundist = 4.8;
	sunlight_pos(mon,day, hour,min)
	diagSun = sun_pos(mon,day, hour,min)
	sunpos_x = sundist*diagSun[0]
	sunpos_y = -sundist*diagSun[1]
	sol.position.set(sunpos_x,0,sunpos_y)
	if (!(Math.round(min) % 15)) { min = Math.round(min)
		document.getElementById("hour").innerHTML = hour + " "
		document.getElementById("min").innerHTML = min + " " }
	}

	