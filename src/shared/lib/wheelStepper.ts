type WheelSample = { deltaY: number; deltaMode: number; timeStamp: number };

/** Pinch scale change (from the last step) that counts as one zoom step. */
const PINCH_STEP_RATIO = 1.15;

/**
 * Safari/WKWebView report a trackpad pinch as `gesturestart`/`gesturechange` with a cumulative
 * `scale`, not as wheel events. Returns 1 when the fingers spread one step (zoom in), -1 when
 * they pinch one step (zoom out), else 0.
 */
export function createPinchStepper() {
  let base = 1;
  return {
    start() {
      base = 1;
    },
    change(scale: number): -1 | 0 | 1 {
      if (!(scale > 0)) {
        return 0;
      }
      if (scale / base >= PINCH_STEP_RATIO) {
        base = scale;
        return 1;
      }
      if (base / scale >= PINCH_STEP_RATIO) {
        base = scale;
        return -1;
      }
      return 0;
    },
  };
}

/** Non-standard WebKit `GestureEvent` (macOS trackpad pinch). */
export type PinchGestureEvent = Event & { scale: number; clientX: number; clientY: number };

/** A pause longer than this starts a new gesture. */
const GESTURE_GAP_MS = 180;
/** Distance a continuous stream must cover per extra step (about two mouse notches). */
const STREAM_STEP_PX = 200;

/**
 * Turns wheel events into discrete zoom steps (-1, 0, 1).
 * A mouse notch is one event → one step. A trackpad swipe or pinch is a stream of
 * dozens of small events (plus momentum) → one step at once, then one per STREAM_STEP_PX,
 * instead of one step per event.
 */
export function createWheelStepper() {
  let lastAt = Number.NEGATIVE_INFINITY;
  let carried = 0;
  return (event: WheelSample): -1 | 0 | 1 => {
    const px =
      event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * 400 : event.deltaY;
    const fresh = event.timeStamp - lastAt > GESTURE_GAP_MS;
    lastAt = event.timeStamp;
    if (px === 0) {
      return 0;
    }
    if (fresh || Math.sign(px) !== Math.sign(carried)) {
      carried = 0;
      if (fresh) {
        return px > 0 ? 1 : -1;
      }
    }
    carried += px;
    if (Math.abs(carried) < STREAM_STEP_PX) {
      return 0;
    }
    carried = 0;
    return px > 0 ? 1 : -1;
  };
}
