
var c;
var ctx;

var x_true = 400.0;
var y_true = 200.0;
var x_speed = 25.0;
var y_speed = 0.0;
var dt = 50; //Timestep in ms
var distance_sd = 10.0;
var particles = [];
var nbeacons = 8;
var beacons = [];
var mean_speed_time = 5.0; //Change speed every 10 seconds
var speed_sd = 2.0;
var min_speed = 0.0;
nparticles = 5000;//$("#nparts").val();

function drawEllipseByCenter(cx, cy, w, h) {
  drawEllipse(cx - w/2.0, cy - h/2.0, w, h);
}

function drawEllipse(x, y, w, h) {
  var kappa = .5522848,
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle

  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  //ctx.closePath(); // not used correctly, see comments (use to close off open path)
  ctx.stroke();
}


function updateDistanceSDInput(val) 
{
      document.getElementById('distanceInput').value=val;
      distance_sd = parseFloat(val); 
}

function updateSpeedSDInput(val) 
{
      document.getElementById('speedSDInput').value=val;
      speed_sd = parseFloat(val)/2.25; 
}

function updateNBeaconsInput(val)
{
	document.getElementById('nBeaconsInput').value=val;
	nbeacons = parseInt(val);
	beacons = [];
	for (i=0; i < nbeacons; i++)
	{
		rand_x = 800*Math.random();
		rand_y = 800*Math.random();
		beacons.push( { "x":rand_x, "y":rand_y, "name":String(i) } );
	}
}

function updateMinSpeedInput(val)
{
	document.getElementById('speedRangeInput').value=val;
	min_speed = parseFloat(val)/2.25;
}


function getRandomArbitrary(mu) {
  return mu*(Math.random()*Math.random()*Math.random()*Math.random()*Math.random()*Math.random() - 1.0)/3.0 ;
}


function possible_speed_change()
{

	var test = Math.random();

	if (test <= 1.0 / (mean_speed_time * 1000.0 / 50.0))
	{

		var v_r = 10.0*Math.random()+min_speed;
		var h = 4.0*Math.acos(0.0)*Math.random();

		x_speed = v_r * Math.sin(h);
		y_speed = v_r * Math.cos(h);
	}
}


function drawBackground()
{
	ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle="#FFFFFF";
    ctx.fillRect(0,0,800,800);
    
}

function draw_particles()
{
	var i = 0; 
	for (i = 0; i < particles.length; i++)
	{
		ctx.fillStyle='rgba(0,0,225,0.1)';
		ctx.fillRect(particles[i].x, particles[i].y, 3, 3);
	}
}


function drawMeanPosition()
{
	var x_mean = 0.0;
	var x_mean_sq = 0.0;
	var y_mean = 0.0;
	var y_mean_sq = 0.0;
	var i = 0;

	for (i=0; i < particles.length; i++)
	{
		x_mean += particles[i].x;
		x_mean_sq += particles[i].x * particles[i].x;
		y_mean += particles[i].y;
		y_mean_sq += particles[i].y * particles[i].y;
	}

	x_mean /= parseFloat(particles.length);
	x_mean_sq /= parseFloat(particles.length);
	y_mean /= parseFloat(particles.length);
	y_mean_sq /= parseFloat(particles.length);

	sd_x = Math.sqrt(x_mean_sq - x_mean*x_mean);
	sd_y = Math.sqrt(y_mean_sq - y_mean*y_mean);

	ctx.beginPath();
    ctx.arc(x_mean, y_mean, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'orange';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#330000';
    ctx.stroke();
    drawEllipseByCenter(x_mean, y_mean, sd_x, sd_y);
    drawEllipseByCenter(x_mean, y_mean, 2.0*sd_x, 2.0*sd_y);
    drawEllipseByCenter(x_mean, y_mean, 3.0*sd_x, 3.0*sd_y);


}

function drawDistanceBeacons()
{
	var i = 0;

	for (i = 0; i < beacons.length; i++)
	{
		ctx.beginPath();
    	ctx.arc(beacons[i].x, beacons[i].y, 10, 0, 2 * Math.PI, false);
    	ctx.fillStyle = 'red';
    	ctx.fill();
    	ctx.lineWidth = 3;
    	ctx.strokeStyle = '#330000';
    	ctx.stroke();
    	ctx.font = "20px Arial";
    	ctx.fillStyle = "#000000";
		ctx.fillText(beacons[i].name,beacons[i].x, beacons[i].y-10);
	}

}


function drawRobot()
{
	

	if (x_true <= 0 || x_true >= 800)
	{
		x_speed *= -1;
	}
	if (y_true <= 0 || y_true >= 800)
	{
		y_speed *= -1;
	}
	x_true += x_speed*(parseFloat(dt)/1000.0);
	y_true += y_speed*(parseFloat(dt)/1000.0);

	ctx.beginPath();
    ctx.arc(x_true, y_true, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
	
}

function getDistanceToAndNameOfBeacon(x,y)
{
	var dists = [];
	var i;
	for (i=0; i<beacons.length; i++)
	{
		var x_d = (x + (getRandomArbitrary(distance_sd)/Math.sqrt(2.0))) - beacons[i].x;
		var y_d = (y + (getRandomArbitrary(distance_sd)/Math.sqrt(2.0))) - beacons[i].y;
		dists.push(Math.sqrt(x_d*x_d + y_d*y_d));
	}
	// Math.max.apply(Math, array);
	var ret_index = dists.indexOf(Math.min.apply(Math,dists));
	var blob = {"distance":dists[ret_index], "name":beacons[ret_index].name};
	return blob;
}

function getDistanceToBeacon(x, y, name)
{
	var dists = [];
	var i;
	for (i=0; i<beacons.length; i++)
	{
		if (beacons[i].name == name)
		{
			var x_d = (x + (getRandomArbitrary(distance_sd)/Math.sqrt(2.0))) - beacons[i].x;
			var y_d = (y + (getRandomArbitrary(distance_sd)/Math.sqrt(2.0))) - beacons[i].y;
			return Math.sqrt(x_d*x_d + y_d*y_d);
		}	
	}	

	return -1;
}


function w_gauss(a, b)
{
    error = a - b;
    g = Math.exp(-((error *error) / (2 * 50.*50.)));
    return g;
}

function loop()
{

	var i = 0;
	possible_speed_change();
	drawBackground();
	drawRobot();
	draw_particles();
	drawDistanceBeacons();
	drawMeanPosition();
	var u = getDistanceToAndNameOfBeacon(x_true, y_true);
	var weights = [];
	var wsum = 0.0;

	for (i=0; i < nparticles; i++)
	{
		var p_u = getDistanceToAndNameOfBeacon(particles[i].x, particles[i].y);
		var w = 0.001;
		if (p_u.name == u.name)
		{
			w = w_gauss(u.distance, p_u.distance);
		}

		weights.push(w);
		wsum += w;
	}

	var weights_norm = [];
	var trimmed_particles = [];

	for (i=0; i < nparticles; i++)
	{
		var w_norm = weights[i] / wsum;

		if (w_norm > 1.0 / (2.0*nparticles)) 
		{
			weights_norm.push(w_norm);
			trimmed_particles.push(particles[i]);
		}
		
	}


	particles = [];
	for (i=0; i< trimmed_particles.length; i++)
	{
		particles.push(trimmed_particles[i]);
	}

	console.log("Number of particles remaining = " + weights_norm.length + " " + particles.length);

	console.log("Confidence: " + 100.0*weights_norm.length / parseFloat(nparticles));

	var cummul = [weights_norm[0]];
	for (i=1; i < weights_norm.length; i++)
	{
		cummul.push(cummul[i-1]+weights_norm[i]);
	}



	console.log("X speed = " + x_speed);
	var resample = [];
	for (i = 0; i < parseInt(nparticles*0.98); i++)
	{
		var rand = Math.random();
		var count = 0;
		while(cummul[count]<=rand && count < particles.length-1)
		{
			count += 1;
		}
		var speed = Math.sqrt(x_speed*x_speed + y_speed*y_speed);
		resample.push({"x":particles[count].x + (x_speed + getRandomArbitrary(speed_sd))*(parseFloat(dt)/1000.0), 
					   "y":particles[count].y + (y_speed + getRandomArbitrary(speed_sd))*(parseFloat(dt)/1000.0), 
					   "weight":weights_norm[count]});
		
	}

	for (i=parseInt(nparticles*0.98); i < nparticles; i++)
	{
		resample.push({"x":800.0 * Math.random(), "y": 800.0 * Math.random(), "weight":0.0});
	}

	for (i=0; i < resample.length; i++)
	{
		particles[i] = resample[i];
	}
	
}

/*
function clicked(event)
{
	var elemLeft = c.offsetLeft;
    var elemTop = c.offsetTop;

	var x = event.pageX - elemLeft;
    var y = event.pageY - elemTop;

    true_x = x;
    true_y = y;
}
*/


function init()
{
	c=document.getElementById("theCanvas");
	ctx = c.getContext("2d");
	//generate random direction

	var v_r = Math.sqrt(x_speed*x_speed + y_speed*y_speed);
	var h = 4.0*Math.acos(0.0)*Math.random();

	x_speed = v_r * Math.sin(h);
	y_speed = v_r * Math.cos(h);
	beacons = [];
	for (i=0; i < nbeacons; i++)
	{
		rand_x = 800*Math.random();
		rand_y = 800*Math.random();
		beacons.push( { "x":rand_x, "y":rand_y, "name":String(i) } );
	}

	
	for (i=0; i < nparticles; i++)
	{
		rand_x = 800*Math.random();
		rand_y = 800*Math.random();
		particle = {"x": rand_x, "y": rand_y, "weight":1.0/parseFloat(nparticles)};
		particles.push(particle);
	}
	console.log(""+particles.length);

    timer_id = setInterval(loop, dt);
           
}


function start()
{
	init();
	$("#startbtn").prop('disabled', true);
	$("#nparts").prop('disabled', true);
}

function stop()
{
	clearInterval(timer_id);
	particles = [];
	start_x = 400;
	$("#startbtn").prop('disabled', false);
	$("#nparts").prop('disabled', false);
}


