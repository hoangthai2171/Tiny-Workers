import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const svg = await readFile(new URL("../assets/tiny-workers-command-center.svg", import.meta.url), "utf8");

test("keeps the plan robot antenna clear of the tagline", () => {
  const taglineMatch = svg.match(/<text x="62" y="(\d+)"[^>]*>ORDERLY AI-AGENT WORK, ONE SMALL STEP AT A TIME<\/text>/);
  const planRobot = svg.match(/<g>\s*<rect x="178" y="166"[\s\S]*?<\/g>/)?.[0];
  const antennaMatch = planRobot?.match(/<circle cx="192" cy="(\d+)" r="3"/);

  assert.ok(taglineMatch, "the banner must contain the expected tagline");
  assert.ok(antennaMatch, "the plan robot must contain its antenna marker");

  const taglineBaseline = Number(taglineMatch[1]);
  const antennaTop = Number(antennaMatch[1]) - 3;
  const minimumClearance = 4;

  assert.ok(
    taglineBaseline + minimumClearance <= antennaTop,
    `expected ${minimumClearance}px of clearance after tagline baseline, got ${antennaTop - taglineBaseline}px`
  );
});
