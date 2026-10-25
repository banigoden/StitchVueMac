import test from "node:test";
import assert from "node:assert/strict";
import { createPinchStepper, createWheelStepper } from "./wheelStepper.ts";

test("pinch steps once per ~15% scale change and restarts per gesture", () => {
  const pinch = createPinchStepper();
  pinch.start();
  // Steps at 1.16 (×1.16 from 1) and 1.34 (×1.155 from 1.16); 1.5 is only ×1.12 from 1.34.
  const spread = [1.05, 1.1, 1.16, 1.25, 1.34, 1.5].map((scale) => pinch.change(scale));
  assert.deepEqual(spread, [0, 0, 1, 0, 1, 0]);
  pinch.start();
  assert.equal(pinch.change(0.86), -1);
  assert.equal(pinch.change(0), 0);
});

const sum = (steps: number[]) => steps.reduce((a, b) => a + b, 0);

test("each separate mouse notch is one step", () => {
  const step = createWheelStepper();
  const notches = [0, 300, 600, 900].map((timeStamp) => step({ deltaY: 100, deltaMode: 0, timeStamp }));
  assert.deepEqual(notches, [1, 1, 1, 1]);
  assert.equal(step({ deltaY: -3, deltaMode: 1, timeStamp: 1200 }), -1);
});

test("a trackpad swipe of many small events does not jump to the last zoom step", () => {
  const step = createWheelStepper();
  // 60 events × 8 px, 16 ms apart (one second of swipe + momentum) = 480 px.
  const steps = Array.from({ length: 60 }, (_, i) => step({ deltaY: 8, deltaMode: 0, timeStamp: i * 16 }));
  assert.equal(steps[0], 1);
  assert.equal(sum(steps), 3);
});

test("reversing direction mid-stream resets the carried distance", () => {
  const step = createWheelStepper();
  assert.equal(step({ deltaY: 5, deltaMode: 0, timeStamp: 0 }), 1);
  const back = Array.from({ length: 30 }, (_, i) => step({ deltaY: -10, deltaMode: 0, timeStamp: 16 + i * 16 }));
  assert.equal(sum(back), -1);
});
