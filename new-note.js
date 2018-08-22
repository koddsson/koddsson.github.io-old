const fs = require("fs");
const { fork, spawn } = require("child_process");

const spawnSync = (cmd, args, options) => {
  return new Promise(resolve => {
    const process = spawn(cmd, args, options);
    process.on("close", resolve);
  });
};

const date = new Date();
const baseFilename = `./notes/${date.toISOString().split("T")[0]}`;
let counter = 0;
let filename = `${baseFilename}-${counter}`;

while (fs.existsSync(`${filename}.md`)) {
  filename = `${baseFilename}-${counter}`;
  counter += 1;
}

const template = `---
pubDate: ${date.toISOString()}
---
`;

fs.writeFileSync(`${filename}.md`, template);

(async function() {
  await spawnSync("git", ["stash"], { stdio: "inherit" });
  await spawnSync("nvim", [`${filename}.md`], { stdio: "inherit" });
  await spawnSync("node", ["regenerate-notes.js"], { stdio: "inherit" });
  await spawnSync("git", ["add", "."], { stdio: "inherit" });
  await spawnSync("git", ["commit", "-m", "🐦 chrip 🦗"], { stdio: "inherit" });
  await spawnSync("git", ["stash", "pop"], { stdio: "inherit" });
  await spawnSync("git", ["--no-pager", "show"], { stdio: "inherit" });
})();
