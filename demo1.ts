import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSSD from '@tensorflow-models/coco-ssd';
import Stats from 'stats.js';

type SizeType = {
  width: number,
  height: number
}

const stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let model: cocoSSD.ObjectDetection | undefined;
let video: HTMLVideoElement | undefined;
let inputCanvas: HTMLCanvasElement | undefined;
let outputCanvas: HTMLCanvasElement | undefined;
let inputContext: CanvasRenderingContext2D | null = null;
let outputContext: CanvasRenderingContext2D | null = null;

// possible base convolutional neural networks models
// - lite_mobilenet_v2
// - mobilenet_v1
// - mobilenet_v2

const constraints = {
  audio: false,
  video: true,
};

window.onload = async function() {
  // load model
  model = await cocoSSD.load({base: 'mobilenet_v2'});

  // create dummy video element
  video = document.createElement('video');
  video.setAttribute('autoplay', 'autoplay');
  video.setAttribute('width', '1280');
  video.setAttribute('height', '720');

  // get input/output canvas and their context
  inputCanvas = document.getElementById('input') as HTMLCanvasElement;
  outputCanvas = document.getElementById('output') as HTMLCanvasElement;
  inputContext = inputCanvas.getContext('2d');
  outputContext = outputCanvas.getContext('2d');

  // request camera access
  navigator
      .mediaDevices
      .getUserMedia(constraints)
      .then(handleSuccess)
      .catch(handleError);
};

function handleSuccess(stream: MediaStream) {
  if (video === undefined) return;

  // stream camera to the dummy video element
  video.srcObject = stream;

  // start painting to prevew and run the objectDetection on the input canvas
  paintVideoToCanvas();
  objectDetection();
}

function paintVideoToCanvas() {
  if (inputCanvas === undefined || outputCanvas === undefined) return;
  if (inputContext === null || outputContext === null) return;
  if (video === undefined) return;

  // start function again on the next frame
  requestAnimationFrame(paintVideoToCanvas);

  // ajust size
  inputCanvas.width = inputCanvas.scrollWidth;
  inputCanvas.height = inputCanvas.scrollHeight;

  // check if video is ready
  if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

  // scale and horizontally center the camera image
  const videoSize = {width: video.videoWidth, height: video.videoHeight};
  const canvasSize = {width: inputCanvas.width, height: inputCanvas.height};
  const renderSize = calculateSize(videoSize, canvasSize);
  const xOffset = (canvasSize.width - renderSize.width) / 2;

  // draw image from video to canvas
  inputContext.drawImage(
      video,
      xOffset,
      0,
      renderSize.width,
      renderSize.height,
  );
}

function handleError(error: Error) {
  console.error(
      'navigator.MediaDevices.getUserMedia error: ',
      error.message,
      error.name,
  );
}


const objectDetection = async function() {
  if (inputContext === null || outputContext === null) return;
  if (inputCanvas === undefined) return;
  if (model === undefined) return;

  stats.begin();
  // get current image from input canvas
  const imageData = inputContext.getImageData(
      0,
      0,
      inputCanvas.width,
      inputCanvas.height,
  );

  // detect objects on input canvas
  const result = await model.detect(imageData);

  // draw input canvas to output canvas
  outputContext.putImageData(imageData, 0, 0);
  outputContext.font = '12px Arial';

  console.log('number of detections: ', result.length);

  // draw detected objects to output canvas
  for (let i = 0; i < result.length; i++) {
    outputContext.beginPath();
    outputContext.rect(...result[i].bbox);
    outputContext.lineWidth = 1;
    outputContext.strokeStyle = 'red';
    outputContext.fillStyle = 'red';
    outputContext.stroke();
    outputContext.fillText(
        result[i].score.toFixed(3) + ' ' + result[i].class, result[i].bbox[0],
      result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10,
    );
  }
  stats.end();
  // start again on the next frame
  requestAnimationFrame(objectDetection);
};

function calculateSize(srcSize: SizeType, dstSize: SizeType) {
  const srcRatio = srcSize.width / srcSize.height;
  const dstRatio = dstSize.width / dstSize.height;
  if (dstRatio > srcRatio) {
    return {
      width: dstSize.height * srcRatio,
      height: dstSize.height,
    };
  } else {
    return {
      width: dstSize.width,
      height: dstSize.width / srcRatio,
    };
  }
}
