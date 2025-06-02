import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as bodyPix from '@tensorflow-models/body-pix';
import Stats from 'stats.js';

const stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
stats.dom.style.left = 'auto';
stats.dom.style.right = '0px';

let model: bodyPix.BodyPix | undefined;
let video: HTMLVideoElement | undefined;
let outputCanvas: HTMLCanvasElement | undefined;
let outputContext: CanvasRenderingContext2D | null = null;

const constraints = {
	audio: false,
	video: true,
};

window.onload = async function () {
	const searchParams = new URLSearchParams(location.search.substr(1));
	const architecture = searchParams.get('architecture');

	if (architecture === 'ResNet50') {
		// ResNet (larger, slower, more accurate)  (~190MS on M1 macbook air)
		model = await bodyPix.load({
			architecture: 'ResNet50',
			outputStride: 32,
			quantBytes: 2,
		});
	} else {
		// MobileNet (smaller, faster, less accurate) (~65MS on M1 macbook air)
		model = await bodyPix.load({
			architecture: 'MobileNetV1',
			outputStride: 16,
			multiplier: 0.75,
			quantBytes: 2,
		});
	}

	// create dummy video element
	video = document.createElement('video');
	video.setAttribute('autoplay', 'autoplay');

	// get input/output canvas and their context
	outputCanvas = document.getElementById('output') as HTMLCanvasElement;
	outputContext = outputCanvas.getContext('2d');

	// request camera access
	navigator.mediaDevices
		.getUserMedia(constraints)
		.then(handleSuccess)
		.catch(handleError);
};

function handleSuccess(stream: MediaStream) {
	if (video === undefined || outputCanvas === undefined) {
		return;
	}

	video.addEventListener('loadeddata', () => {
		// start painting to prevew and run the objectDetection on the input canvas
		bodySegmentation();
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
	console.error(
		'navigator.MediaDevices.getUserMedia error: ',
		error.message,
		error.name,
	);
}

const bodySegmentation = async function () {
	if (outputContext === null || outputCanvas === undefined) {
		return;
	}
	if (model === undefined || video === undefined) {
		return;
	}

	stats.begin();
	// segmentation of the persion
	const segmentation = await model.segmentPerson(video, {
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
		outputCanvas,
		video,
		coloredPartImage,
		opacity,
		maskBlurAmount,
		flipHorizontal,
	);

	stats.end();

	// start again on the next frame
	requestAnimationFrame(bodySegmentation);
};
