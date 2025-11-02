import fs from "node:fs";
import path from "node:path";

const summaryFile = path.resolve("coverage", "summary.txt");

if (!fs.existsSync(summaryFile)) {
  console.error("Coverage summary not found:", summaryFile);
  process.exit(1);
}

const summary = fs.readFileSync(summaryFile, "utf8");

const trackedFiles = new Map([
  ["src/utils/aiAnalysis.ts", false],
  ["src/utils/validation.ts", false],
]);

const threshold = 80;
const violations = [];

for (const line of summary.split(/\r?\n/)) {
  for (const file of trackedFiles.keys()) {
    if (line.includes(file)) {
      const match = line.match(/\|\s+([0-9.]+)\s+\|\s+([0-9.]+)/);
      if (!match) {
        violations.push(`Unable to parse coverage for ${file}`);
        trackedFiles.set(file, true);
        continue;
      }

      const linesPct = parseFloat(match[2]);
      if (Number.isNaN(linesPct)) {
        violations.push(`Invalid line coverage value for ${file}`);
      } else if (linesPct + 1e-6 < threshold) {
        violations.push(
          `${file} line coverage ${linesPct.toFixed(2)}% is below ${threshold}%`
        );
      }
      trackedFiles.set(file, true);
    }
  }
}

for (const [file, seen] of trackedFiles.entries()) {
  if (!seen) {
    violations.push(`Coverage summary missing entry for ${file}`);
  }
}

if (violations.length > 0) {
  console.error("Coverage threshold not met:\n" + violations.join("\n"));
  process.exit(1);
}

console.log("Coverage thresholds satisfied.");
