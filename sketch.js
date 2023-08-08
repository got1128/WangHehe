

let mic;
let x;
let y;
let maxDiameter = 400;
let grid;
let currentXPos = 0;
let micLevel = 1;
let textToDisplay = "Wang Hehe";
let fft;

let numWaves = 50;
let waveHeight;
let waveWidth;


class Particle {
  // setting the co-ordinates, radius and the
  // speed of a particle in both the co-ordinates axes.
  constructor() {
    this.x = random(0, width);
    this.y = random(0, height * 2 / 3);
    this.r = random(1, 2);
    this.xSpeed = random(-1, 1);
    this.ySpeed = random(-1, 0);
  }

  // creation of a particle.
  createParticle() {
    noStroke();
    fill('rgba(180,50,250,0.1)');//節點
    circle(this.x, this.y, this.r);
  }

  // setting the particle in motion.
  moveParticle() {
    if (this.x < 0 || this.x > width)
      this.xSpeed *= -1;
    if (this.y < 0 || this.y > height)
      this.ySpeed *= -1;
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }

  // this function creates the connections(lines)
  // between particles which are less than a certain distance apart
  joinParticles(particles) {
    particles.forEach(element => {
      let dis = dist(this.x, this.y, element.x, element.y);
      if (dis < 55) {
        strokeWeight(1.5)
        stroke('rgba(180,50,250,0.1)');//線的顏色
        line(this.x, this.y, element.x, element.y);
      }
    });
  }
}

// an array to add multiple particles
let particles = [];



function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);


  grid = new Grid();
  grid.isCheckboardOn = false; // switch to true to get a red/black checkboard
  grid.isCenterPtOn = false; // switch to true to draw center pt
  fill(0, 0, 255);
  for (let i = 0; i < width / 6; i++) {
    particles.push(new Particle());
  }
  cnv.mousePressed(userStartAudio);

  // See https://p5js.org/reference/#/p5.AudioIn
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
  waveHeight = height / numWaves;

  x = width / 2;
  y = height / 2;

  fill(200, 0, 0, 200);
  noStroke();
  textAlign(CENTER, CENTER);
  maxDiameter = min(width, height);
  print("setup(): I only run once!");
  printAudioSourceInformation();
  waveHeight = height / numWaves;
  waveWidth = width / numWaves;
  waveColor = color(250, 0, 150, 50); // 初始颜色为蓝色
}



function draw() {

  if (mouseIsPressed) {
    // 要畫的顏色：(0, 0, 0) ~ (255, 255, 255) => 黑色 ~ 白色
    fill(220, 220, 220);
    // 畫線，上一個 previous (pmouseX, pmouseY) 到現在滑鼠位置(mouseX, mouseY)
    line(mouseX, mouseY, pmouseX, pmouseY);
  }


  if (!mic.enabled || getAudioContext().state !== 'running') {
    background(100);
    drawEnableMicText();
    return;
  }

  print("draw() frameCnt=", frameCount);
  background(200);

  Wave()




  for (let i = 0; i < particles.length; i++) {
    particles[i].createParticle();
    particles[i].moveParticle();
    particles[i].joinParticles(particles.slice(i));
  }


  noStroke();
  fill(255, 255, 255, 40);
  textSize(250);
  textStyle(BOLD); // 将文字设置为粗体
  text(textToDisplay, width / 2, height / 2);

  fill(255, 255, 255, 200);
  textSize(180);
  textStyle(BOLD); // 将文字设置为粗体
  text(textToDisplay, width / 2, height / 0.95 / 2);
  grid.draw();


}

function Wave() {
  let spectrum = fft.analyze();

  for (let i = 0; i < numWaves; i++) {
    let yOffset = i * waveHeight;
    let amp = map(spectrum[i], 0, 255, 10, waveHeight * 2.5);
    let freq = map(i, 0, numWaves, 0, 0.52); // 控制波浪的频率范围
    drawWave(yOffset, amp, freq);
  }
}
function drawWave(yOffset, amplitude, frequency) {

  fill(waveColor);
  beginShape();
  for (let x = 0; x <= width; x += waveWidth) {
    let angle = map(x, 0, width, 0, TWO_PI * frequency);
    let y = yOffset + sin(angle) * amplitude;
    vertex(x, y);
  }
  endShape();
}



function drawEnableMicText() {
  push();

  fill(255);
  noStroke();

  const fontSize = 20;
  const instructionText = "Touch or click the screen to begin";
  textSize(fontSize);

  const strWidth = textWidth(instructionText);
  const xText = width / 2;
  const yText = height / 2;
  text(instructionText, xText, yText);

  pop();
}

function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
    background(100);
  }
}

function mouseClicked() {
  getAudioContext().resume().then(() => {
    console.log('Playback resumed successfully');
    background(100);
  });
}

function printAudioSourceInformation() {
  let micSamplingRate = sampleRate();
  print(mic);

  // For debugging, it's useful to print out this information
  // https://p5js.org/reference/#/p5.AudioIn/getSources
  mic.getSources(function (devices) {
    print("Your audio devices: ")
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo
    devices.forEach(function (device) {
      print("  " + device.kind + ": " + device.label + " id = " + device.deviceId);
    });
  });
  print("Sampling rate:", sampleRate());

  // Helpful to determine if the microphone state changes
  getAudioContext().onstatechange = function () {
    print("getAudioContext().onstatechange", getAudioContext().state);
  }
}
