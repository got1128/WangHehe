let goFullScreen = false;
let mic, fft;
let micSetupError;
let waveformBuffer = [];
let instantWaveFormVis;
let spectrumVis;
let waveformVis;
let spectrogram;
let backgroundColor;

const numFftBins = 1024;
const showLengthInSeconds = 30;

function setup() {
    let canvasWidth = 800; // windowWidth
    let canvasHeight = 600;

    if (goFullScreen) {
        canvasWidth = windowWidth;
        canvasHeight = windowHeight;
    }

    createCanvas(canvasWidth, canvasHeight);

    mic = new p5.AudioIn();
    mic.start();

    print(mic);

    fft = new p5.FFT(0, numFftBins);
    fft.setInput(mic);

    let micSamplingRate = sampleRate();

    backgroundColor = color(90);

    // split the canvas into different parts for the visualization
    let yTop = 0;
    let yHeight = height / 3;
    waveformVis = new WaveformVisualizer(0, yTop, width, yHeight, backgroundColor, showLengthInSeconds);
    yTop = waveformVis.getBottom();
    spectrogram = new Spectrogram(0, yTop, width, yHeight, backgroundColor, showLengthInSeconds);

    let xSplit = width / 2;
    // when we call fft.waveform(), this function returns an array of sound amplitude values 
    // (between -1.0 and +1.0). Length of this buffer is equal to bins (defaults to 1024). 
    let lengthOfOneWaveformBufferInSecs = numFftBins / micSamplingRate;
    yTop = spectrogram.getBottom();
    instantWaveFormVis = new InstantWaveformVis(0, yTop, xSplit, yHeight, backgroundColor, lengthOfOneWaveformBufferInSecs);
    spectrumVis = new SpectrumVisualizer(xSplit, yTop, width, yHeight, backgroundColor);



    //print(mic);

    //print(getAudioContext());

    // https://p5js.org/reference/#/p5.AudioIn/getSources
    mic.getSources(function (devices) {

        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo
        devices.forEach(function (device) {
            console.log(device.kind + ": " + device.label +
                " id = " + device.deviceId);
        });
    });

    print("Sampling rate:", sampleRate(), "Master volume:", getMasterVolume());
    noFill();

    //frameRate(2);
}

function audioInErrorCallback() {
    print("Error setting up the microphone input");
}

function draw() {
    background(220);

    let waveform = fft.waveform(); // analyze the waveform
    let spectrum = fft.analyze();

    instantWaveFormVis.update(waveform);
    instantWaveFormVis.draw();

    waveformVis.update(waveform);
    waveformVis.draw();

    spectrogram.update(spectrum);
    spectrogram.draw();

    spectrumVis.update(spectrum);
    spectrumVis.draw();
    // waveformBuffer = waveformBuffer.concat(waveform);
    // beginShape();
    // strokeWeight(1);
    // print(waveformBuffer.length);
    // for (let i = 0; i < waveformBuffer.length; i++) {
    //   let x = map(i, 0, waveformBuffer.length, 0, width);
    //   let y = map(waveformBuffer[i], -1, 1, height, 0);
    //   vertex(x, y);
    // }
    // endShape();


    //print((waveform.length / sampleRate()) * 1000 + "ms");
    fill(255);
    text("fps: " + nfc(frameRate(), 1), 10, 15);

    //print(mic);
    //print(mic.getSources());
}

function touchStarted() {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
}

function mouseClicked() {
    getAudioContext().resume().then(() => {
        console.log('Playback resumed successfully');
    });
}