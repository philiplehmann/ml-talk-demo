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

// possible base cnn models
// - lite_mobilenet_v2
// - mobilenet_v1
// - mobilenet_v2

const constraints = {
  audio: false,
  video: true,
};

window.onload = async function() {
  model = await cocoSSD.load({base: 'mobilenet_v2'});
  video = document.createElement('video');
  video.setAttribute('autoplay', 'autoplay');
  video.setAttribute('width', '1280');
  video.setAttribute('height', '720');
  inputCanvas = document.getElementById('input') as HTMLCanvasElement;
  outputCanvas = document.getElementById('output') as HTMLCanvasElement;
  inputContext = inputCanvas.getContext('2d');
  outputContext = outputCanvas.getContext('2d');

  navigator
      .mediaDevices
      .getUserMedia(constraints)
      .then(handleSuccess)
      .catch(handleError);
};

function handleSuccess(stream: MediaStream) {
  if (video === undefined) return;

  video.srcObject = stream;
  paintVideoToCanvas();
  objectDetection();
}

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

function paintVideoToCanvas() {
  if (inputCanvas === undefined || outputCanvas === undefined) return;
  if (inputContext === null || outputContext === null) return;
  if (video === undefined) return;

  requestAnimationFrame(paintVideoToCanvas);
  inputCanvas.width = inputCanvas.scrollWidth;
  inputCanvas.height = inputCanvas.scrollHeight;
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    // scale and horizontally center the camera image
    const videoSize = {width: video.videoWidth, height: video.videoHeight};
    const canvasSize = {width: inputCanvas.width, height: inputCanvas.height};
    const renderSize = calculateSize(videoSize, canvasSize);
    const xOffset = (canvasSize.width - renderSize.width) / 2;
    inputContext.drawImage(
        video,
        xOffset,
        0,
        renderSize.width,
        renderSize.height,
    );
  }
}

function handleError(error: Error) {
  console.error(
      'navigator.MediaDevices.getUserMedia error: ',
      error.message,
      error.name,
  );
}


const objectDetection = async () => {
  if (inputContext === null || outputContext === null) return;
  if (inputCanvas === undefined) return;
  if (model === undefined) return;

  stats.begin();
  const imageData = inputContext.getImageData(
      0,
      0,
      inputCanvas.width,
      inputCanvas.height,
  );
  const result = await model.detect(imageData);

  outputContext.putImageData(imageData, 0, 0);
  outputContext.font = '10px Arial';

  console.log('number of detections: ', result.length);
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
  requestAnimationFrame(objectDetection);
};
