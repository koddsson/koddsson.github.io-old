const fs = require("fs");

const [, , title, link] = process.argv;

const usage = () => {
  console.log("make-link [title] [url]");
};

if (!title || !link) {
  usage();
}

fs.readFile("./_template", "utf8", (error, data) => {
  if (error) {
    console.log(error);
  }

  const newData = data.replace("LINK_GOES_HERE", link);

  fs.writeFile(`./${title}.html`, newData, error => {
    if (error) {
      console.log(error);
    }
  });
});
