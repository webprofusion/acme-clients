const UpgradeHelper = require("@11ty/eleventy-upgrade-help");
const fs = require("fs");
const htmlmin = require("html-minifier");

module.exports = function (eleventyConfig) {

  eleventyConfig.addGlobalData("clients", "clients");

  eleventyConfig.addPlugin(UpgradeHelper);
  
  // custom filter for data lists : https://www.11ty.dev/docs/languages/liquid/#multiple-filter-arguments
  eleventyConfig.addFilter("categoryFilter", function (value, category) {
    return value.filter(v => v.categories.includes(category));
  });

  if (process.env.ELEVENTY_PRODUCTION) {
    eleventyConfig.addTransform("htmlmin", htmlminTransform);
  } else {
    eleventyConfig.setBrowserSyncConfig({ callbacks: { ready: browserSyncReady } });
  }

  // Passthrough
  eleventyConfig.addPassthroughCopy({ "src/static": "." });

  // Watch targets
  eleventyConfig.addWatchTarget("./src/styles/");

  var pathPrefix = "";
  //if (process.env.GITHUB_REPOSITORY) {
  //  pathPrefix = process.env.GITHUB_REPOSITORY.split('/')[1];
  //}

  return {
    dir: {
      input: "src"
    },
    pathPrefix
  }
};

function browserSyncReady(err, bs) {
  bs.addMiddleware("*", (req, res) => {
    const content_404 = fs.readFileSync('_site/404.html');
    // Provides the 404 content without redirect.
    res.write(content_404);
    // Add 404 http status code in request header.
    // res.writeHead(404, { "Content-Type": "text/html" });
    res.writeHead(404);
    res.end();
  });
}

function htmlminTransform(content, outputPath) {
  if (outputPath.endsWith(".html")) {
    let minified = htmlmin.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true
    });
    return minified;
  }
  return content;
}
