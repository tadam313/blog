"use strict";

var gulp = require("gulp");
// Loads the plugins without having to list all of them, but you need
// to call them as $.pluginname
var $ = require("gulp-load-plugins")();
// "del" is used to clean out directories and such
var del = require("del");
// merge is used to merge the output from two different streams into the same stream
var merge = require("merge-stream");


var jekyllTempFolder = "./.jekyll_build";


var siteFolder = "./site";


gulp.task("clean", del.bind({}, [jekyllTempFolder, siteFolder]));


gulp.task("jekyll", $.shell.task("jekyll build --destination " + jekyllTempFolder));

// Compiles the SASS files and moves them into the "assets/stylesheets" directory
gulp.task("styles", ["jekyll"], function () {

  return gulp.src("src/assets/scss/main.scss")
    .pipe($.sass())
    .pipe($.autoprefixer("last 2 versions", { cascade: true }))
    .pipe(gulp.dest(jekyllTempFolder + "/assets/stylesheets/"))
    .pipe($.size({title: "styles"}));
    // Injects the CSS changes to your browser since Jekyll doesn"t rebuild the CSS
    // .pipe(reload({stream: true}));
});

// Optimizes the images that exists
gulp.task("images", function () {
  return gulp.src("src/assets/images/**")
    .pipe($.changed(siteFolder + "/assets/images"))
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(siteFolder + "/assets/images"))
    .pipe($.size({title: "images"}));
});

// Copy over fonts to the "site" directory
gulp.task("fonts", function () {
  return gulp.src("src/assets/fonts/**")
    .pipe(gulp.dest(siteFolder + "/assets/fonts"))
    .pipe($.size({ title: "fonts" }));
});


gulp.task("deploy", function () {
  // Deploys your optimized site, you can change the settings in the html task if you want to
  return gulp.src(siteFolder + "/**/*")
    .pipe($.ghPages({
      // Currently only personal GitHub Pages are supported so it will upload to the master
      // branch and automatically overwrite anything that is in the directory
      branch: "master"
    }));
});

// Run JS Lint against your JS
gulp.task("jslint", function () {
  gulp.src(jekyllTempFolder + "/assets/scripts/**/*.js")
    // Checks your JS code quality against your .jshintrc file
    .pipe($.jshint(".jshintrc"))
    .pipe($.jshint.reporter());
});

// Runs "jekyll doctor" on your site to check for errors with your configuration
// and will check for URL errors a well
gulp.task("doctor", $.shell.task("jekyll doctor"));

gulp.task("build-site", ["jekyll", "styles", "fonts", "images"], function() {
  var assets = $.useref.assets({ searchPath: jekyllTempFolder });

  return gulp.src(jekyllTempFolder + "/**/*.html")
    .pipe(assets)
    .pipe($.if("*.js", $.uglify({ preserveComments: "some" })))
    .pipe($.if("*.css", $.minifyCss()))
    .pipe($.revAll({ ignore: [".eot", ".svg", ".ttf", ".woff"] }))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe($.if("*.html", $.htmlmin({
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeCDATASectionsFromCDATA: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true
    })))
    .pipe(gulp.dest(siteFolder))
    .pipe($.size({title: "site"}));
});

gulp.task("build", ["build-site"], function(done) {
  del([jekyllTempFolder], done);
});

gulp.task("serve", ["build"], $.shell.task("jekyll serve --skip-initial-build"));

gulp.task("watch", function () {
  gulp.watch([
      "src/**/*.md",
      "src/**/*.html",
      "src/**/*.xml",
      "src/**/*.txt",
      "src/**/*.js"
    ],
    [
      "jekyll:dev"
    ]);

  gulp.watch(["src/assets/scss/**/*.scss"], ["styles"]);
});

// Checks your CSS, JS and Jekyll for errors
gulp.task("check", ["jslint", "doctor"], function () {
  // Better hope nothing is wrong.
});

// Default task, run when just writing "gulp" in the terminal
gulp.task("default", ["serve", "watch"]);
