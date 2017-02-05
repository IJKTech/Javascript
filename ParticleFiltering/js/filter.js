
var c;
var ctx;

var start_x = 600;
var x_speed = 2;
var dt = 1;
var nparticles = 0;
var distance_sd = 50;
var speed_sd = 2;
var particles = [];
var timer_id;


function getRandomArbitrary(mu) {
  return mu*(Math.random()*Math.random()*Math.random()*Math.random()*Math.random()*Math.random() - 1.0)/3.0 ;
}

function updateTextInput(val) 
{
      document.getElementById('textInput').value=val; 
      nparticles = $("#nparts").val();
		
}

function updateSpeedInput(val) 
{
      document.getElementById('speedInput').value=val; 
      x_speed = parseFloat($("#robot_speed").val());
}

function updateLocationInput(val) 
{
      document.getElementById('locationInput').value=val;
      start_x = parseInt(val); 
}

function updateDistanceSDInput(val) 
{
      document.getElementById('distanceInput').value=val;
      distance_sd = parseFloat(val); 
}

function updateSpeedSDInput(val) 
{
      document.getElementById('speedSDInput').value=val;
      speed_sd = parseFloat(val); 
}

function drawBackground()
{
	ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle="#FFFFFF";
    ctx.fillRect(0,0,800,400);
    ctx.fillStyle="#00FF00";
    ctx.fillRect(0,350,800,50);
    ctx.fillStyle="#FF0000";
    ctx.fillRect(50,300,5,50);
    ctx.fillRect(750,300,5,50);
}


function drawConfidence(trimmed_particles, trimmed_weights)
{
	var i=0;
	bins = {};

	ctx.beginPath();
	ctx.moveTo(0,100);
	ctx.lineTo(800,100);
	ctx.stroke();

	for (i=0; i<800; i = i+10)
	{
		bins[String(i)] = 0;
	}  

	for (i=0; i < trimmed_particles.length; i++)
	{
		bins[String(10*parseInt(trimmed_particles[i].x/10))] += trimmed_weights[i];
	}

	for (i=0; i < 800; i = i+10)
	{
		
		ctx.fillStyle="#FF0000";
		ctx.fillRect(i, 100, 5, -parseInt(bins[String(i)]*100.0) );
		
	}
}

function drawRobot()
{
	ctx.fillStyle="#000000";
	start_x += x_speed*dt;
	if (start_x >= 750 || start_x <= 50)
	{
		x_speed *= -1;
	}
	ctx.fillRect(start_x, 300, 10, 50);
	
}


function getDistanceToNearest(x)
{
	var to_far =Math.abs(x - 750);
	var to_near = Math.abs(x - 50);
	var true_dist;

	if (to_far > to_near)
	{
		true_dist = to_near;
	}
	else
	{
		true_dist = to_far;
	}

	true_dist = true_dist + getRandomArbitrary(distance_sd);
	return true_dist;
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
	drawBackground();
	drawRobot();
	
	for (i=0; i < nparticles; i++)
	{
		ctx.fillStyle='rgba(0,0,225,0.1)';;
		ctx.fillRect(particles[i].x, 345, 2,2);
	}

	var u = getDistanceToNearest(start_x);
	var weights = [];
	var wsum = 0.0;

	for (i=0; i < nparticles; i++)
	{
		var distance = getDistanceToNearest(particles[i].x);
		var w = w_gauss(u, distance);
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

	drawConfidence(trimmed_particles, weights_norm);

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
	for (i = 0; i < nparticles-5; i++)
	{
		var rand = Math.random();
		var count = 0;
		while(cummul[count]<=rand && count < particles.length-1)
		{
			count += 1;
		}
		
		resample.push({"x":particles[count].x + (x_speed+getRandomArbitrary(x_speed/2.0)*dt), "y":particles[count].y, "weight":weights_norm[count]});
		
	}

	for (i=nparticles-5; i < nparticles; i++)
	{
		resample.push({"x":50 + Math.random()*750, "y": 345.0, "weight":0.0});
	}

	for (i=0; i < resample.length; i++)
	{
		particles[i] = resample[i];
	}

}


function init()
{
	c=document.getElementById("theCanvas");
	ctx = c.getContext("2d");
	
	
	nparticles = $("#nparts").val();
	for (i=0; i < nparticles; i++)
	{
		rand_x = 50 + Math.random()*750;//getRandomArbitrary(50, 750);
		particle = {"x": rand_x, "y": 345.0, "weight":1.0/100.0};

		particles.push(particle);
		rand_y = 345;
	}

    ctx=c.getContext("2d");
    drawBackground();
    timer_id = setInterval(loop, 500);
           
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


