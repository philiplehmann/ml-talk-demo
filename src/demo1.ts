import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSSD from '@tensorflow-models/coco-ssd';
import Stats from 'stats.js';

const stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
stats.dom.style.left = 'auto';
stats.dom.style.right = '0px';

let model: cocoSSD.ObjectDetection | undefined;
let video: HTMLVideoElement | undefined;
let outputCanvas: HTMLCanvasElement | undefined;
let outputContext: CanvasRenderingContext2D | null = null;

const constraints = {
  audio: false,
  video: true,
};

window.onload = async () => {
  // load model
  // possible base convolutional neural networks models
  // - lite_mobilenet_v2
  // - mobilenet_v1
  // - mobilenet_v2
  model = await cocoSSD.load({ base: 'mobilenet_v2' });

  // create dummy video element
  video = document.createElement('video');
  video.setAttribute('autoplay', 'autoplay');

  // get input/output canvas and their context
  outputCanvas = document.getElementById('output') as HTMLCanvasElement;
  outputContext = outputCanvas.getContext('2d');

  // request camera access
  navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
};

function handleSuccess(stream: MediaStream) {
  if (video === undefined || outputCanvas === undefined) {
    return;
  }

  video.addEventListener('loadeddata', () => {
    // start painting to prevew and run the objectDetection on the input canvas
    objectDetection();
  });
  // stream camera to the dummy video element
  video.srcObject = stream;

  const { width = 0, height = 0 } = stream.getTracks()[0].getSettings();
  video.setAttribute('width', String(width));
  video.setAttribute('height', String(height));
  outputCanvas.setAttribute('width', String(width));
  outputCanvas.setAttribute('height', String(height));
}

function handleError(error: Error) {
  console.error('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

const objectDetection = async () => {
  if (outputContext === null || model === undefined || video === undefined) {
    return;
  }

  stats.begin();

  // detect objects on input canvas
  const result = await model.detect(video);

  // draw input canvas to output canvas
  outputContext.drawImage(video, 0, 0, video.width, video.height);
  outputContext.font = '14px Arial';

  // console.log('number of detections: ', result.length);

  // draw detected objects to output canvas
  for (let i = 0; i < result.length; i++) {
    outputContext.beginPath();
    outputContext.rect(...result[i].bbox);
    outputContext.lineWidth = 1;
    outputContext.strokeStyle = 'red';
    outputContext.fillStyle = 'red';
    outputContext.stroke();
    outputContext.fillText(
      `${result[i].score.toFixed(3)} ${result[i].class}`,
      result[i].bbox[0],
      result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10,
    );
  }
  stats.end();
  // start again on the next frame
  requestAnimationFrame(objectDetection);
};
