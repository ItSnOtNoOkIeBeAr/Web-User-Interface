// Report text shown in each lab's collapsible sections.
// EDIT THESE so the wording matches your printed laboratory report exactly.
export interface Report {
  objective: string
  procedure: string[]
  algorithm: string[]
  results: string
  conclusion: string
}

export const REPORTS: Record<number, Report> = {
  1: {
    objective: 'Load an image with OpenCV and manipulate it at the pixel level: inspect its shape, work with BGR/RGB/grayscale channel orders, crop a region of interest, resize, and rotate.',
    procedure: ['Read the image with cv2.imread / cv2.imdecode (BGR order).', 'Print img.shape and dtype.', 'Convert between BGR, RGB and grayscale with cv2.cvtColor.', 'Crop with NumPy slicing img[y1:y2, x1:x2].', 'Resize with cv2.resize and rotate with cv2.rotate.'],
    algorithm: ['Images are H×W×3 uint8 arrays; OpenCV stores channels as B, G, R.', 'Grayscale: Y = 0.299 R + 0.587 G + 0.114 B.', 'Resize uses interpolation (nearest, bilinear, bicubic, area).'],
    results: 'Hovering the Pixel Lab shows the true B, G, R values of each pixel. Viewing BGR data as RGB swaps red and blue, which is the classic channel-order mistake. Crop, resize and rotate change the array shape as shown in the toolkit.',
    conclusion: 'Understanding the array layout and channel order of an image is the foundation for every later lab.',
  },
  2: {
    objective: 'Detect edges with the Sobel gradient operator and the Canny detector, and study how blur and thresholds change the result.',
    procedure: ['Convert to grayscale.', 'Smooth with a Gaussian blur.', 'Compute Sobel X and Y gradients and combine into a magnitude.', 'Run Canny with low/high thresholds.', 'Compare the results side by side.'],
    algorithm: ['Sobel: convolve with 3×3 derivative kernels; magnitude = √(Gx² + Gy²).', 'Canny: Gaussian smoothing → gradient → non-maximum suppression → double threshold → hysteresis.'],
    results: 'Sobel gives thick, graded edges; Canny gives thin, connected one-pixel edges. Raising the thresholds removes weak edges; larger blur removes noise but also fine detail.',
    conclusion: 'Canny produces cleaner edges than Sobel at the cost of two tunable thresholds.',
  },
  3: {
    objective: 'Improve image contrast using global histogram equalization, CLAHE, color-space equalization and linear contrast stretching.',
    procedure: ['Convert to grayscale and compute the histogram.', 'Apply cv2.equalizeHist.', 'Apply CLAHE with a clipLimit and tile grid.', 'Equalize color images in YUV (Y) and HSV (V).', 'Apply percentile-based linear stretching.'],
    algorithm: ['Global HE maps intensities through the normalized cumulative histogram (CDF).', 'CLAHE equalizes small tiles and clips the histogram at clipLimit to limit noise amplification, with bilinear blending between tiles.'],
    results: 'Global HE flattens the histogram but can over-amplify noise and bright regions; CLAHE keeps local detail with fewer artifacts. Equalizing only luminance preserves colors.',
    conclusion: 'CLAHE is usually the better choice for photos with uneven lighting.',
  },
  4: {
    objective: 'Detect and match local features using SURF and compare it with ORB and SIFT.',
    procedure: ['Detect keypoints and compute descriptors.', 'Match descriptors with a brute-force matcher and k-NN.', "Filter matches with Lowe's ratio test.", 'Compare keypoints, matches and run time across detectors.', 'Test rotation behavior with upright SURF (U-SURF).'],
    algorithm: ['SURF approximates the Hessian determinant using box filters on an integral image; hessianThreshold controls how many keypoints survive.', "Lowe's ratio test keeps a match only if best distance < ratio × second-best distance.", 'SURF is patented/non-free; when unavailable this app falls back to ORB.'],
    results: 'A lower ratio gives fewer but more reliable matches. ORB is the fastest; SIFT/SURF are more robust to scale and rotation. U-SURF is faster but not rotation invariant.',
    conclusion: 'Choose the detector by the speed/robustness trade-off and by licensing constraints.',
  },
  5: {
    objective: 'Apply PCA to face images (eigenfaces) and classify identities with an RBF SVM on the reduced features.',
    procedure: ['Load LFW (min_faces_per_person=70, resize=0.4).', 'Split 80/20 with random_state=42.', 'Fit PCA (150 components, randomized, whitened) on the training set only.', 'Project train/test data and train SVC(kernel="rbf", class_weight="balanced").', 'Evaluate with a classification report and inspect errors.'],
    algorithm: ['PCA finds orthogonal directions of maximum variance (eigenfaces); a face is a weighted sum of the mean face and eigenfaces.', 'Fitting only on training data avoids leakage.', 'The RBF SVM separates classes in the PCA subspace.'],
    results: 'A small number of components already captures most variance; the cumulative curve shows how many are needed for 90%. Reconstructions sharpen as components are added. The report lists precision/recall per person.',
    conclusion: 'PCA gives a compact representation that makes a simple classifier effective, though lighting and pose still cause misclassifications.',
  },
  6: {
    objective: 'Detect objects in images and live video using YOLO and understand the dataset/label format used for training.',
    procedure: ['Load yolo11n.pt (and yolov8n.pt) with Ultralytics.', 'Run inference on images and webcam frames.', 'Adjust the confidence threshold.', 'Visualize YOLO-format labels.', 'Review the dataset structure, data.yaml and training commands.'],
    algorithm: ['YOLO is a single-stage detector: one network pass predicts boxes, objectness and classes on a grid, followed by non-maximum suppression.', 'Labels: "class cx cy w h" normalized to 0–1.'],
    results: 'Detections appear with class, confidence and counts per class; a higher confidence threshold removes uncertain boxes at the risk of missed objects.',
    conclusion: 'YOLOv11n gives real-time detection on modest hardware; custom training needs a labeled dataset in YOLO format.',
  },
  7: {
    objective: 'Segment images with deep learning (DeepLabV3) and classical methods (thresholding, watershed, contours, region growing) and measure quality with IoU.',
    procedure: ['Run DeepLabV3 (VOC classes) and overlay the class mask.', 'Grow a region from a clicked seed point.', 'Apply global, Otsu and adaptive thresholds.', 'Run watershed and contour-based segmentation.', 'Compute IoU against a ground-truth mask.'],
    algorithm: ['DeepLabV3 uses atrous (dilated) convolutions for dense per-pixel classification.', 'Region growing adds neighbors within a color tolerance of the seed.', 'Otsu picks the threshold that minimizes intra-class variance.', 'IoU = |A∩B| / |A∪B|.'],
    results: 'DeepLab labels whole objects semantically; classical methods depend on intensity contrast. Otsu works best on bimodal images such as the coins sample.',
    conclusion: 'Deep models generalize better but are heavier; classical methods are fast and effective on simple, high-contrast scenes.',
  },
}
