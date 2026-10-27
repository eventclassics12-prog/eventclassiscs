/**
 * Extracts the animation JSON out of a .lottie archive.
 *
 * A .lottie file is a zip holding a manifest and one or more animation
 * documents. lottie-web reads plain JSON, not the archive, so the JSON is
 * extracted and served on its own.
 *
 *   node scripts/extract-lottie.mjs
 */

import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const LOTTIE_DIR = resolve(HERE, "../public/lottie");

for (const file of readdirSync(LOTTIE_DIR)) {
  if (!file.endsWith(".lottie")) continue;

  const archive = join(LOTTIE_DIR, file);
  const listing = execFileSync("unzip", ["-Z1", archive], { encoding: "utf8" })
    .split("\n")
    .filter((line) => line.startsWith("animations/") && line.endsWith(".json"));

  if (listing.length === 0) {
    throw new Error(`${file} carries no animation document`);
  }

  const document = listing[0];
  const json = execFileSync("unzip", ["-p", archive, document], {
    encoding: "utf8",
  });

  const target = join(
    LOTTIE_DIR,
    file.replace(/\.lottie$/, ".json"),
  );
  writeFileSync(target, json);

  console.log(`Wrote ${target} (from ${document})`);
}
