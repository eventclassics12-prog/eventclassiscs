/**
 * Crops a Lottie animation to the bounds of the artwork it draws.
 *
 * The source file draws its print in one corner of a square canvas and leaves
 * the rest empty, so the animation arrives with dead space around it. Cropping
 * the canvas to what is actually drawn lets the element be sized to the
 * artwork instead of to the empty space, and lets the artwork sit where the
 * layout expects it.
 *
 * The crop is a shift on every layer plus a smaller canvas, which leaves the
 * animation's own timing untouched.
 *
 *   node scripts/crop-lottie.mjs <file.json> [padding]
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [input, paddingArg] = process.argv.slice(2);
if (!input) {
  console.error("usage: node scripts/crop-lottie.mjs <file.json> [padding]");
  process.exit(1);
}

const file = resolve(input);
const padding = Number(paddingArg ?? 0);
const animation = JSON.parse(readFileSync(file, "utf8"));

/**
 * Every value a property takes over the timeline.
 *
 * A property that is not animated holds one value; an animated one holds a
 * list of keyframes, each carrying the value from its own moment. The crop
 * has to contain the artwork at every moment, so all of them count.
 */
function valuesOf(property) {
  if (!property || property.k === undefined) return [];
  if (property.a !== 1) return [property.k];
  return property.k
    .map((keyframe) => keyframe.s)
    .filter((value) => value !== undefined);
}

/** Every point a property places something at. */
function pointsOf(property) {
  return valuesOf(property)
    .map((value) => (Array.isArray(value) ? value : [value, 0]))
    .filter((value) => Number.isFinite(value[0]) && Number.isFinite(value[1]));
}

/** Every scalar a property takes. */
function scalarsOf(property) {
  return valuesOf(property)
    .map((value) => (Array.isArray(value) ? value[0] : value))
    .filter((value) => Number.isFinite(value));
}

/** Every vertex a path passes through. */
function verticesOf(shape) {
  const key = shape.ks?.k;
  if (!key) return [];

  if (Array.isArray(key)) {
    // An animated path holds one shape per keyframe, and each of those is
    // itself a list of the shape's own values.
    return key.flatMap((keyframe) => {
      const value = keyframe.s;
      if (!value) return [];
      return (Array.isArray(value) ? value : [value]).flatMap(
        (shape) => shape?.v ?? [],
      );
    });
  }
  return key.v ?? [];
}

/**
 * The bounds of the shapes in a group, in the group's own space.
 *
 * A group's contents are moved by the group's own transform, so the inner
 * bounds are transformed before they are returned.
 */
function shapeBounds(group) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const include = (x, y) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };

  const visit = (node) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== "object") return;

    if (node.ty === "gr") {
      const inner = shapeBounds(
        node.it?.filter((item) => item.ty !== "tr") ?? [],
      );
      if (!inner) return;

      const transform = node.it?.find((item) => item.ty === "tr");
      const anchors = pointsOf(transform?.a);
      const positions = pointsOf(transform?.p);
      const scales = valuesOf(transform?.s);
      const rotations = scalarsOf(transform?.r);

      const corners = [
        [inner.minX, inner.minY],
        [inner.maxX, inner.minY],
        [inner.minX, inner.maxY],
        [inner.maxX, inner.maxY],
      ];

      // A group's transform can be animated too, so every combination is
      // applied and the widest result is kept.
      for (const anchor of anchors.length ? anchors : [[0, 0]]) {
        for (const position of positions.length ? positions : [[0, 0]]) {
          for (const scale of scales.length ? scales : [[100, 100]]) {
            for (const rotation of rotations.length ? rotations : [0]) {
              const angle = (rotation * Math.PI) / 180;
              const cos = Math.cos(angle);
              const sin = Math.sin(angle);

              for (const [x, y] of corners) {
                const dx = (x - anchor[0]) * (scale[0] / 100);
                const dy = (y - anchor[1]) * (scale[1] / 100);
                include(
                  position[0] + dx * cos - dy * sin,
                  position[1] + dx * sin + dy * cos,
                );
              }
            }
          }
        }
      }
      return;
    }

    if (node.ty === "el") {
      pointsOf(node.p).forEach(([cx, cy]) => {
        const [w, h] = valuesOf(node.s)[0] ?? [0, 0];
        include(cx - w / 2, cy - h / 2);
        include(cx + w / 2, cy + h / 2);
      });
      return;
    }

    if (node.ty === "rc") {
      pointsOf(node.p).forEach(([cx, cy]) => {
        const [w, h] = valuesOf(node.s)[0] ?? [0, 0];
        include(cx - w / 2, cy - h / 2);
        include(cx + w / 2, cy + h / 2);
      });
      return;
    }

    if (node.ty === "sh") {
      verticesOf(node).forEach(([x, y]) => include(x, y));
      return;
    }

    if (node.it) visit(node.it);
  };

  visit(group);

  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

/** The bounds of one layer, in the canvas's space. */
function layerBounds(layer) {
  const local = (layer.shapes ?? [])
    .map((group) => shapeBounds(group))
    .filter(Boolean)
    .reduce(
      (acc, bounds) => ({
        minX: Math.min(acc.minX, bounds.minX),
        minY: Math.min(acc.minY, bounds.minY),
        maxX: Math.max(acc.maxX, bounds.maxX),
        maxY: Math.max(acc.maxY, bounds.maxY),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    );

  if (!Number.isFinite(local.minX)) return null;

  // A layer's transform is often animated, and the artwork can travel while
  // it moves. The crop has to contain the artwork at every moment, so every
  // combination of position, scale and rotation is applied and the widest
  // result is kept.
  const anchors = pointsOf(layer.ks?.a);
  const positions = pointsOf(layer.ks?.p);
  const scales = valuesOf(layer.ks?.s);
  const rotations = scalarsOf(layer.ks?.r);

  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  for (const anchor of anchors.length ? anchors : [[0, 0, 0]]) {
    for (const position of positions.length ? positions : [[0, 0, 0]]) {
      for (const scale of scales.length ? scales : [[100, 100, 100]]) {
        for (const rotation of rotations.length ? rotations : [0]) {
          const angle = (rotation * Math.PI) / 180;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          const apply = (x, y) => {
            const dx = (x - anchor[0]) * (scale[0] / 100);
            const dy = (y - anchor[1]) * (scale[1] / 100);
            return [
              position[0] + dx * cos - dy * sin,
              position[1] + dx * sin + dy * cos,
            ];
          };

          const corners = [
            apply(local.minX, local.minY),
            apply(local.maxX, local.minY),
            apply(local.minX, local.maxY),
            apply(local.maxX, local.maxY),
          ];

          for (const [x, y] of corners) {
            bounds.minX = Math.min(bounds.minX, x);
            bounds.minY = Math.min(bounds.minY, y);
            bounds.maxX = Math.max(bounds.maxX, x);
            bounds.maxY = Math.max(bounds.maxY, y);
          }
        }
      }
    }
  }

  return bounds;
}

const bounds = animation.layers
  .map(layerBounds)
  .filter(Boolean)
  .reduce(
    (acc, b) => ({
      minX: Math.min(acc.minX, b.minX),
      minY: Math.min(acc.minY, b.minY),
      maxX: Math.max(acc.maxX, b.maxX),
      maxY: Math.max(acc.maxY, b.maxY),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );

if (!Number.isFinite(bounds.minX)) {
  console.error(`${file} draws nothing`);
  process.exit(1);
}

const left = Math.floor(bounds.minX - padding);
const top = Math.floor(bounds.minY - padding);
const right = Math.ceil(bounds.maxX + padding);
const bottom = Math.ceil(bounds.maxY + padding);

const width = right - left;
const height = bottom - top;

// Every layer is shifted so the artwork lands where it was drawn, and the
// canvas is resized to the artwork's own box.
//
// A layer's position is where its artwork sits in the canvas, so shifting it
// is what moves the artwork. An animated position is shifted at every
// keyframe, so the artwork moves with the crop rather than sliding out of it
// as the animation plays.
for (const layer of animation.layers) {
  // Children inherit the crop from their parent. Moving them again breaks
  // the rig, with the offset compounding at every level of the hierarchy.
  if (layer.parent != null) continue;
  const position = layer.ks?.p;
  if (!position) continue;

  if (position.a === 0) {
    position.k = [position.k[0] - left, position.k[1] - top, position.k[2] ?? 0];
    continue;
  }

  for (const keyframe of position.k) {
    if (keyframe.s) {
      keyframe.s = [
        keyframe.s[0] - left,
        keyframe.s[1] - top,
        keyframe.s[2] ?? 0,
      ];
    }

    if (keyframe.e) {
      keyframe.e = [keyframe.e[0] - left, keyframe.e[1] - top, keyframe.e[2] ?? 0];
    }
    // `to` and `ti` are relative tangent vectors, so translation leaves
    // them unchanged.
  }
}

animation.w = width;
animation.h = height;

writeFileSync(file, `${JSON.stringify(animation)}\n`);

console.log(
  `Cropped ${file} to ${width}x${height} (artwork at ${Math.round(bounds.minX)},${Math.round(bounds.minY)})`,
);
