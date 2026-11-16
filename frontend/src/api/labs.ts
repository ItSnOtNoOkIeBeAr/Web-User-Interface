// One typed client per lab, all built on postForm/getJson.
import { getJson, postForm } from './client'

type S = AbortSignal | undefined

// ---------- Lab 1 ----------
export const lab1 = {
  info: (file: Blob) => postForm<{ shape: number[]; dtype: string; size: number; mean_bgr: number[] }>('/lab1/info', { file }),
  crop: (file: Blob, x: number, y: number, w: number, h: number, s?: S) =>
    postForm<{ image: string; shape: number[] }>('/lab1/crop', { file, x, y, w, h }, s),
  resize: (file: Blob, scale: number, interp: string, s?: S) =>
    postForm<{ image: string; shape: number[] }>('/lab1/resize', { file, scale, interp }, s),
  rotate: (file: Blob, times: number, s?: S) => postForm<{ image: string; shape: number[] }>('/lab1/rotate', { file, times }, s),
}

// ---------- Lab 2 ----------
export interface EdgeResult { original: string; gray: string; sobel: string; sobel_x: string; sobel_y: string; canny: string; canny_pixels: number }
export const lab2 = {
  edges: (file: Blob, p: { blur: number; ksize: number; t1: number; t2: number; fmt?: string; max_side?: number }, s?: S) =>
    postForm<EdgeResult>('/lab2/edges', { file, ...p }, s),
}

// ---------- Lab 3 ----------
export interface EqResult {
  gray: string; he: string; clahe: string
  hist: { original: number[]; he: number[]; clahe: number[] }
  stats: Record<string, { mean: number; std: number }>
}
export const lab3 = {
  equalize: (file: Blob, clip: number, tile: number, s?: S) => postForm<EqResult>('/lab3/equalize', { file, clip, tile }, s),
  color: (file: Blob, s?: S) => postForm<{ original: string; yuv: string; hsv: string }>('/lab3/color', { file }, s),
  stretch: (file: Blob, low: number, high: number, s?: S) =>
    postForm<{ gray: string; stretched: string; lo: number; hi: number; hist: { original: number[]; stretched: number[] } }>('/lab3/stretch', { file, low, high }, s),
}

// ---------- Lab 4 ----------
export interface MatchResult {
  img1: string; img2: string; size1: number[]; size2: number[]
  lines: { a: number[]; b: number[] }[]; total_matches: number; used: string; notice: string
  race: { name: string; available: boolean; keypoints: number; matches: number; ms: number }[]
  synthetic_second_view: boolean
}
export const lab4 = {
  match: (img1: Blob, img2: Blob | null, detector: string, ratio: number, hessian: number, s?: S) =>
    postForm<MatchResult>('/lab4/match', { img1, img2, detector, ratio, hessian }, s),
  keypoints: (file: Blob, p: { detector: string; hessian: number; upright: boolean; rich: boolean; angle: number }, s?: S) =>
    postForm<{ images: { original: string; rotated: string }; counts: { original: number; rotated: number }; used: string; notice: string }>('/lab4/keypoints', { file, ...p }, s),
}

// ---------- Lab 5 ----------
export interface Lab5Stats { n_samples: number; height: number; width: number; n_features: number; classes: string[]; counts: number[]; train: number; test: number }
export interface Lab5Model {
  accuracy: number; eigenfaces: { first: string[]; last: string[] }; mean_face: string
  cumulative_variance: number[]; n_for_90: number
  report: { name: string; precision: number; recall: number; 'f1-score': number; support: number }[]
  report_avg: { precision: number; recall: number; 'f1-score': number }
  misclassified: { image: string; true: string; pred: string }[]; test_count: number
}
export const lab5 = {
  status: () => getJson<{ status: string; message: string }>('/lab5/status'),
  train: (force = false) => postForm<{ status: string }>(`/lab5/train?force=${force}`, {}),
  stats: () => getJson<Lab5Stats>('/lab5/stats'),
  model: () => getJson<Lab5Model>('/lab5/model'),
  faces: () => getJson<{ index: number; thumb: string }[]>('/lab5/test-faces'),
  reconstruct: (index: number, k: number, s?: S) =>
    getJson<{ original: string; reconstruction: string; newest_eigenface: string; k: number; rmse: number }>(`/lab5/reconstruct?index=${index}&k=${k}`, s),
  identify: (index: number) => getJson<{ predicted: string; true: string; correct: boolean }>(`/lab5/identify?index=${index}`),
}

// ---------- Lab 6 ----------
export interface Detection { label: string; conf: number; box: number[] }
export interface DetectResult { boxes: Detection[]; counts: Record<string, number>; ms: number; classes: number; image?: string }
export const lab6 = {
  detect: (file: Blob, model: string, conf: number, annotate = false, s?: S) =>
    postForm<DetectResult>('/lab6/detect', { file, model, conf, annotate }, s),
  custom: (file: Blob) => postForm<{ ok: boolean; classes: string[] }>('/lab6/custom-model', { file }),
  labelViz: (image: Blob, labels: Blob, names: string) => postForm<{ image: string; boxes: number }>('/lab6/label-viz', { image, labels, names }),
}

// ---------- Lab 7 ----------
export interface DeepLabResult { image: string; overlay: string; class_map: string; classes: { id: number; name: string; color: string; percent: number }[]; size: number[] }
export interface ClassicResult {
  original: string; images: Record<string, string>; masks: Record<string, string>
  extra: { watershed_regions: number; contours: number }
  iou?: Record<string, number>; iou_inverted?: Record<string, number>
}
export const lab7 = {
  deeplab: (file: Blob, s?: S) => postForm<DeepLabResult>('/lab7/deeplab', { file }, s),
  grow: (file: Blob, x: number, y: number, tol: number, s?: S) =>
    postForm<{ image: string; order: string; steps: number; area_percent: number; size: number[] }>('/lab7/region-grow', { file, x, y, tol }, s),
  classic: (file: Blob, gt: Blob | null, thresh: number, block: number, c: number, s?: S) =>
    postForm<ClassicResult>('/lab7/classic', { file, gt, thresh, block, c }, s),
}

// ---------- Live camera ----------
export const live = {
  frame: (file: Blob, effect: string, p1: number, p2: number) =>
    postForm<{ image: string; info: { counts?: Record<string, number>; ms?: number } }>('/live/frame', { file, effect, p1, p2 }),
}
