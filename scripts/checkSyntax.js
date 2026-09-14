const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const runtimeDirectories = [
  "controller",
  "middleware",
  "model",
  "routes",
  "services",
  "utils",
  "workers",
];

const runtimeFiles = [
  "index.js",
  "connect.js",
  "worker.js",
  "services.config.js",
];

function getJavaScriptFiles(directory) {
  const files = [];

  if (!fs.existsSync(directory)) {
    return files;
  }

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...getJavaScriptFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

const filesToCheck = [
  ...runtimeFiles.filter(fs.existsSync),
  ...runtimeDirectories.flatMap(getJavaScriptFiles),
];

let hasErrors = false;

for (const file of filesToCheck) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error("\nJavaScript syntax validation failed.");
  process.exit(1);
}

console.log(`JavaScript syntax validation passed (${filesToCheck.length} files).`);
