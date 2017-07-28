var click = 0;
var speed = 9;
var score = 0;
var topScore = 0;
var playing = false;
var ballFreq, barFreq, modAmp, modFreq, bounceFreq, bar, ball, tBound, bBound, lBound, rBound;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);

  //bar
  barOsc = new p5.Oscillator('triangle');
  barOsc.freq(240);
  barOsc.amp(.3);
  barOsc.pan(-1)

  bar = createSprite(width/2, height-50, 100, 20);
  bar.immovable = true;

  //ball
  ballOsc = new p5.Oscillator('square');
  ballOsc.freq(240);
  ballOsc.amp(.05);
  ballOsc.pan(1);

  //ball modulate sound
  modulator = new p5.Oscillator('sine');
  modulator.amp(0);
  modulator.freq(5);
  modulator.pan(1);
  modulator.disconnect();
  ballOsc.amp(modulator);

  env = new p5.Env ();
  env.setADSR (0.01, 0.1, 0.5, 0.1);
  env.setRange(2, 0);

  ball = createSprite(width/2, height/2, 50, 50);
  ball.addAnimation("img/id1.png", "img/id2.png", "img/id3.png", "img/id4.png", "img/id5.png", "img/id6.png", "img/id7.png", "img/id8.png", "img/id9.png", "img/id10.png");

  //bonce sound
  bounceOsc = new p5.Oscillator("triangle");
  bounceOsc.amp(env);
  bounceOsc.start();
  bounceOsc.disconnect();

  delay = new p5.Delay();
  delay.process(bounceOsc, .15, .5, 2400);
  delay.setType('pingPong');

  //boundaries
  tBound = createSprite(width/2, -40, width, 40);
  tBound.immovable = true;
  bBound = createSprite(width/2, height + 40, width, 40);
  bBound.immovable = true;
  lBound = createSprite(-40, height/2, 40, height);
  lBound.immovable = true;
  rBound = createSprite(width +40, height/2, 40, height);
  rBound.immovable = true;
}

//sketch
function draw() {

  if (click == 1) {
    bar.position.x = constrain(mouseX, bar.width/2, width-bar.width/2);
  } else if (click == 2) {
    if (keyIsDown(RIGHT_ARROW)) {
      bar.position.x = constrain(bar.position.x + 10, bar.width/2, width-bar.width/2);
    }
    if (keyIsDown(LEFT_ARROW)) {
      bar.position.x = constrain(bar.position.x - 10, bar.width/2, width-bar.width/2);
    }
  }

  var r = map (ball.position.x, 0, width, 0, 255);
  var b = map (ball.position.x, 0, width, 255, 0);
  var g = map (ball.position.y, 0, height, 125, 20)

  background(r,g,b);

  var r = map (bar.position.x, 0, width, 0, 255);
  var b = map (bar.position.x, 0, width, 255, 0);
  var g = map (ball.position.y, 0, height, 20, 125)
  bar.shapeColor = color(b, g,r);

  ballFreq = map (ball.position.x, 0, width, 150, 500);
  ballOsc.freq (ballFreq);

  barFreq = map (bar.position.x, 0, width, 150, 500);
  barOsc.freq(barFreq);

  modAmp = map(ball.position.y, 0, height, 0, .2);
  modulator.amp(modAmp, 0.01);

  modFreq = map(ball.position.y, 0, height, 0, 25);
  modulator.freq (modFreq);

  bounceFreq = map(ball.position.y, 0, height, 900, 250);
  bounceOsc.freq (bounceFreq);

  if (ball.bounce(bBound)) {
    env.play();
    click = 0;
    speed = 9;
    ball.velocity.x = 0; ball.velocity.y = 0;
    bar.position.x = width/2; ball.position.y = height/2;
    ball.position.x = width/2;
    modulator.stop();
    ballOsc.stop();
    barOsc.stop();
    playing = false;
    instructions();
    if (score > topScore) {
      topScore = score;
    }
    Materialize.toast('You scored ' + score, 4000);
    responsiveVoice.speak('You scored ' + score, "US English Female", {pitch: 2});
    setTimeout(function(){
      Materialize.toast('Top score ' + topScore, 5000);
      responsiveVoice.speak('Top score ' + topScore, "US English Female", {pitch: 2});
    }, 2500);
    score = 0;
  }

  if (ball.bounce(tBound)) {
    if (playing) {  env.play(); };
  };
  if (ball.bounce(lBound)) {
    if (playing) {  env.play(); };
  };
  if (ball.bounce(rBound)) {
    if (playing) {  env.play(); };
  };

  if(ball.bounce(bar)) {
    var swing = (ball.position.x-bar.position.x)/3;
    ball.setSpeed(speed, ball.getDirection()+swing);
    env.play();
    score += 1;
    }

  drawSprites();
}

//start game
function startGame() {
  responsiveVoice.cancel();

  if ($("input[id='mouse']").is(':checked') || $("input[id='finger']").is(':checked')) {
    click = 1;
  }
  else {
    click = 2;
  }

  speed = $("input[type=range]").val() ** 2;
  ball.setSpeed(speed, random(-50, -75));

  if (!playing) {
    modulator.start();
    ballOsc.start();
    barOsc.start();
    playing = true;
  }
}

// space bar
function keyPressed() {
  if (keyCode == '32') {
    startGame();
    $('#modal').modal('close');
  }
}

// Materialize UI
function instructions() {
  $('#modal').modal('open', {dismissible: false, opacity: 0});
  ball.setSpeed(speed);
}

$('#play').click(function(){ startGame(); return false;});

window.onload = function() {
  instructions();
};

$(document).ready(function(){
  $('.collapsible').collapsible({
    onOpen: function(el) { $('.face').text('sentiment_very_satisfied'); },
    onClose: function(el) { $('.face').text('sentiment_dissatisfied'); },
  });
 });

 $("input[id='finger']").on("change",function(){
  responsiveVoice.speak("");
  responsiveVoice.cancel();
});
