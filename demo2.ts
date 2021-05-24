import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as bodyPix from '@tensorflow-models/body-pix';
import Stats from 'stats.js';

type SizeType = {
  width: number,
  height: number
}

const stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let model: bodyPix.BodyPix | undefined;
let video: HTMLVideoElement | undefined;
let inputCanvas: HTMLCanvasElement | undefined;
let outputCanvas: HTMLCanvasElement | undefined;
let inputContext: CanvasRenderingContext2D | null = null;
let outputContext: CanvasRenderingContext2D | null = null;

const constraints = {
  audio: false,
  video: true,
};

window.onload = async function() {
  // ResNet (larger, slower, more accurate)  (~190MS on M1 macbook air)
  model = await bodyPix.load({
    architecture: 'ResNet50',
    outputStride: 32,
    quantBytes: 2,
  });
  // MobileNet (smaller, faster, less accurate) (~65MS on M1 macbook air)
  // model = await bodyPix.load({
  //   architecture: 'MobileNetV1',
  //   outputStride: 16,
  //   multiplier: 0.75,
  //   quantBytes: 2,
  // });

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
  if (inputCanvas === undefined || outputCanvas === undefined) return;
  if (model === undefined) return;

  // start again on the next frame
  requestAnimationFrame(objectDetection);

  stats.begin();
  // get current image from input canvas
  const imageData = inputContext.getImageData(
      0,
      0,
      inputCanvas.width,
      inputCanvas.height,
  );

  // segmentation of the persion
  const segmentation = await model.segmentPerson(imageData, {
    flipHorizontal: false,
    internalResolution: 'medium',
    segmentationThreshold: 0.7,
  });
  const coloredPartImage = bodyPix.toMask(segmentation);
  const opacity = 0.8; // 0 - 1;
  const flipHorizontal = false;
  const maskBlurAmount = 10; // 0 - 20
  // Draw the mask image on top of the original image onto a canvas.
  // The colored part image will be drawn semi-transparent, with an opacity of
  // 0.7, allowing for the original image to be visible under.
  bodyPix.drawMask(
      outputCanvas, inputCanvas, coloredPartImage, opacity, maskBlurAmount,
      flipHorizontal,
  );


  stats.end();
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
