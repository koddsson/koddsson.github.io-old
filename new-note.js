const fs = require("fs");

const date = new Date();
const filename = `./notes/${date.toISOString().split("T")[0]}.md`;
const title = process.env[2];

if (!title) {
  console.log("Usage: <title>");
  process.exit(1);
}

if (fs.existsSync(filename)) {
  console.log(`${filename} already exists`);
  process.exit(1);
}

const template = `---
title: Vegetable season at Noma 🥕
pubDate: 2018-08-20T20:19:51.843Z
---
`;

fs.writeFileSync(filename, template);

const child = child_process.spawn("nvim", [filename], {
  stdio: "inherit"
});

child.on("exit", function(e, code) {
  console.log("finished");
});
