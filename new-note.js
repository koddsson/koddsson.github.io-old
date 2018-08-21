const fs = require("fs");
const { fork, spawn } = require("child_process");

const date = new Date();
const baseFilename = `./notes/${date.toISOString().split("T")[0]}`;
let filename = baseFilename;
let counter = 0;

while (fs.existsSync(`${filename}.md`)) {
  filename = `${baseFilename}-${counter}`;
  counter += 1;
}

const template = `---
pubDate: ${date.toISOString()}
---
`;

fs.writeFileSync(`${filename}.md`, template);

spawn("nvim", [`${filename}.md`], { stdio: "inherit" });
spawn("node", ["regenerate-notes.js"], { stdio: "inherit" });
