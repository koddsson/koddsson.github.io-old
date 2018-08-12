const { promisify } = require("util");
const { readFile, readdir, writeFile } = require("fs");
const readFileAsync = promisify(readFile);
const readDirAsync = promisify(readdir);
const writeFileAsync = promisify(writeFile);

function htmlTemplate(content) {
  const page = `<html>
  <head></head>
  <body>
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

  const { title, pubDate, ...rest } = metadata;
  const isoDate = pubDate.split("T")[0];

  const rss = `
<item>
  <title>${title}</title>
  <description>${post}</description>
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

  const { title, pubDate, ...rest } = metadata;
  const isoDate = pubDate.split("T")[0];

  const html = `
<div class="post">
  <h3>${title}</h3>
  <time>${new Date(pubDate).toUTCString()}</time>
  ${Object.entries(rest).map(([key, value]) => {
    return `<meta ${key}="${value}">`;
  })}
  <div class="body">
    ${post.trim()}   
  </div>
</div>
`;

  await writeFileAsync(`./notes/${isoDate}.html`, htmlTemplate(html));
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
  const page = `<html>
  <head></head>
  <body>
    ${posts.join("\n")}
  </body>
</html>
`;
  writeFileAsync("./notes/index.html", page, "utf8");
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

  createPostsPage(htmls);
  createFeed(rsss);
})();
