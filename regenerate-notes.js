const { promisify } = require("util");
const { readFile, readdir, writeFile } = require("fs");
const readFileAsync = promisify(readFile);
const readDirAsync = promisify(readdir);
const writeFileAsync = promisify(writeFile);

function htmlTemplate(content) {
  const page = `<html>
  <head>
    <title>Notes</title>
    <link rel="icon" data-emoji="📝" type="image/png">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="/scripts/emoji-favicon.js"></script>
    <link rel="stylesheet" href="/index.css">
  </head>
  <body style="padding: 1em">
    ${content}
  </body>
</html>
`;
  return page;
}

function splitOnce(text, seperator) {
  const i = text.indexOf(seperator);
  const splits = [text.slice(0, i), text.slice(i + 1)];
  return splits;
}

async function createRSSFile(filename) {
  const content = await readFileAsync(filename, "utf8");
  const [metadataText, post] = content.split("---").filter(c => c !== "");
  const metadata = metadataText
    .split("\n")
    .filter(t => t !== "")
    .reduce((obj, curr) => {
      const [key, value] = splitOnce(curr, ":");
      obj[key] = value.trim();
      return obj;
    }, {});

  const { pubDate, ...rest } = metadata;
  const isoDate = pubDate.split("T")[0];

  const rss = `
<item>
  <description>${post.trim()}</description>
  <pubDate>${new Date(pubDate).toUTCString()}</pubDate>
  <link>https://koddsson.com/notes/${isoDate}.html</link>
  <guid isPermaLink="true">
    https://koddsson.com/notes/${isoDate}.html
  </guid>
</item>
`;

  return rss;
}

async function createHTMLFile(filename) {
  const content = await readFileAsync(filename, "utf8");
  const [metadataText, post] = content.split("---").filter(c => c !== "");
  const metadata = metadataText
    .split("\n")
    .filter(t => t !== "")
    .reduce((obj, curr) => {
      const [key, value] = splitOnce(curr, ":");
      obj[key] = value.trim();
      return obj;
    }, {});

  const { pubDate, ...rest } = metadata;
  const isoDate = pubDate.split("T")[0];
  const link = filename
    .replace(".md", ".html")
    .split("/")
    .pop();

  const html = `
<div class="post">
  <div class="meta">
    ${Object.entries(rest).map(([key, value]) => {
      return `<meta ${key}="${value}">`;
    })}
  </div>
  <div class="body">
    ${post.trim()}   
  </div>
  <a href="/notes/${link}" class="timestamp">
    <time>${new Date(pubDate).toUTCString()}</time>
  </a>
</div>
`;

  await writeFileAsync(`./notes/${link}`, htmlTemplate(html));
  return html;
}

function createFeed(items) {
  const page = `<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
  <title>koddsson.com notes</title>
  <description>notes</description>
  <link>https://koddsson.com</link>
  <atom:link href="https://koddsson.com/notes/feed.xml" rel="self" type="application/rss+xml"/>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items.join("\n")}
  </channel>
</rss>
`;
  writeFileAsync("./notes/feed.xml", page, "utf8");
}

function createPostsPage(posts) {
  writeFileAsync(
    "./notes/index.html",
    htmlTemplate("<h1>📝 Notes</h1>" + posts.join("\n")),
    "utf8"
  );
}

async function addToIndex(posts) {
  const index = await readFileAsync("./index-template.html", "utf8");
  writeFileAsync(
    "./index.html",
    index.replace("$$NOTES_GO_HERE$$", posts.slice(0, 5).join("\n")),
    "utf8"
  );
}

(async function() {
  const filenames = await readDirAsync("./notes/");
  const markdownFiles = filenames
    .filter(filename => filename.endsWith(".md"))
    .map(filename => `./notes/${filename}`);

  const htmls = [];
  const rsss = [];

  for (const filename of markdownFiles) {
    const html = await createHTMLFile(filename);
    htmls.push(html);
    const rss = await createRSSFile(filename);
    rsss.push(rss);
  }

  htmls.reverse();

  createPostsPage(htmls);
  createFeed(rsss);
  await addToIndex(htmls);
})();
