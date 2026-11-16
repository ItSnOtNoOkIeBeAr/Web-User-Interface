// Metadata for the 7 labs: used by the nav, home tiles, spotlight carousel, and lab page headers.
export interface LabMeta {
  n: number
  path: string
  title: string
  topic: string
  emoji: string
  color: string
  spotlight: string
  blurb: string
  toolkit: string[]
  sample: string       // default sample image from /samples
  preview: string      // preview PNG generated from the real backend (samples/previews)
}

export const LABS: LabMeta[] = [
  { n: 1, path: '/lab1', title: 'Image Manipulation', topic: 'Pixels, channels, crop, resize, rotate', emoji: '🔬', color: '#ff5d8f',
    spotlight: 'Pixel Lab', blurb: 'Hover to magnify pixels into a B-G-R grid, paint on the image, and flip BGR / RGB / gray.',
    toolkit: ['Shape info', 'Crop ROI', 'Resize', 'Rotate 90°'], sample: 'astronaut.jpg', preview: 'previews/pixel.png' },
  { n: 2, path: '/lab2', title: 'Edge Detection', topic: 'Gaussian blur, Sobel, Canny', emoji: '⚡', color: '#ffb703',
    spotlight: 'Live Edge Vision', blurb: 'Real-time Canny and Sobel on your webcam with a split-screen wipe and live threshold knobs.',
    toolkit: ['Blur size', 'Sobel X / Y', 'Sobel ksize'], sample: 'cat.jpg', preview: 'previews/canny.png' },
  { n: 3, path: '/lab3', title: 'Histogram Equalization', topic: 'Global HE, CLAHE, contrast stretching', emoji: '🌗', color: '#3ddc97',
    spotlight: 'Contrast Rescue', blurb: 'Rescue a dark or washed-out photo and watch the histogram morph between HE and CLAHE.',
    toolkit: ['Grayscale', 'Color equalization', 'Linear stretch'], sample: 'dark.jpg', preview: 'previews/clahe.png' },
  { n: 4, path: '/lab4', title: 'SURF Features', topic: 'Keypoints, descriptors, matching', emoji: '🧭', color: '#38bdf8',
    spotlight: 'Feature Match-Up', blurb: 'Animated match lines between two views, a ratio-test knob, and a SURF vs ORB vs SIFT race.',
    toolkit: ['Hessian threshold', 'Rich keypoints', 'U-SURF on a rotated copy'], sample: 'astronaut.jpg', preview: 'previews/matches.png' },
  { n: 5, path: '/lab5', title: 'PCA / Eigenfaces', topic: 'Dimensionality reduction + SVM', emoji: '👻', color: '#a78bfa',
    spotlight: 'Face Rebuilder', blurb: 'Slide from 1 to 150 components to rebuild a face from ghostly eigenfaces, then ask the SVM who it is.',
    toolkit: ['Dataset stats', 'Eigenface gallery', '90% variance', 'Classification report', 'Misclassified faces'], sample: 'astronaut.jpg', preview: 'previews/pca.png' },
  { n: 6, path: '/lab6', title: 'YOLO Detection', topic: 'Real-time object detection', emoji: '🎯', color: '#fb7185',
    spotlight: 'Object Spotter Cam', blurb: 'YOLOv11n on your webcam with animated boxes, per-class counters, FPS and a confidence knob.',
    toolkit: ['Image detection', 'YOLOv8n switch', 'Custom best.pt', 'Label visualizer', 'Dataset + train commands'], sample: 'cat.jpg', preview: 'previews/yolo.png' },
  { n: 7, path: '/lab7', title: 'Segmentation', topic: 'DeepLabV3, region growing, classical', emoji: '🎨', color: '#2dd4bf',
    spotlight: 'Magic Segmenter', blurb: 'Semantic masks fade in with hover-to-highlight, plus click-to-grow region flooding.',
    toolkit: ['Global / Otsu / adaptive', 'Watershed', 'Contours', 'Compare + IoU'], sample: 'cat.jpg', preview: 'previews/deeplab.png' },
]

export const labByN = (n: number) => LABS[n - 1]
