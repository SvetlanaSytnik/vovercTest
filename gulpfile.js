var gulp = require('gulp'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'),
    postcss = require('gulp-postcss'),
    concatcss = require('gulp-concat-css'),
    cssnano = require('gulp-cssnano'),
    browserify = require('browserify'),
    vinylSourceStream = require('vinyl-source-stream'),
    vinylBuffer = require('vinyl-buffer'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require("gulp-rename"),
    autoprefixer = require('autoprefixer'),
    server = require('browser-sync').create(),
    imagemin = require('gulp-imagemin'),
    svgstore = require('gulp-svgstore'),
    posthtml = require('gulp-posthtml'),
    include = require('posthtml-include'),
    run = require('run-sequence'),
    del = require('del'),
    concatjs = require('gulp-concat'),
    partImport = require('gulp-html-import'),
    uglifyjs = require('gulp-uglify');

gulp.task('html', function() {
    gulp.src('./dev/*.html')
        .pipe(partImport('./dev/partials/'))
        .pipe(posthtml([
            include()
        ]))
        .pipe(server.stream())
        .pipe(gulp.dest('./build/'));
});

gulp.task('style', function (){
    gulp.src(
        ['./dev/assets/sass/main.scss'])
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(concatcss('style.css'))
        .pipe(gulp.dest('./build/assets/styles'))
        .pipe(cssnano())
        .pipe(concatcss('style.css'))
        .pipe(rename({suffix: ".min"}))
        .pipe(gulp.dest('./build/assets/styles'))
        .pipe(server.stream());
});

gulp.task("images", function () {
    return gulp.src("./dev/assets/images/**/*.{png,jpg,svg}")
        .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest("./build/assets/images"));
});

gulp.task("photos", function () {
	return gulp.src("./dev/assets/photos/**/*.{png,jpg,svg,gif}")
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.svgo()
		]))
		.pipe(gulp.dest("./build/assets/photos"));
});

gulp.task("sprite", function () {
    return gulp.src("./dev/assets/images/**/icon-*.svg")
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("./build/assets/images"));
});

gulp.task('libs', function (){
    return gulp.src(
        [
            './node_modules/jquery/dist/jquery.min.js',
			'./node_modules/slick-carousel/slick/slick.min.js',
            './node_modules/aos/dist/aos.js'
        ])
        .pipe(concatjs('lib.js'))
        .pipe(uglifyjs())
        .pipe(gulp.dest('./build/assets/js/lib'))
        .pipe(server.stream());
});

gulp.task('copy', function (){
    return gulp.src([
        'dev/assets/fonts/**/*.{woff,woff2}',
        'dev/assets/images/**'
    ],{
        base: 'dev'
    })
        .pipe(gulp.dest('build'));
});

gulp.task('clean', function(){
    return del('./build')
});

gulp.task('scripts', function () {
    return browserify({entries:'./dev/assets/js/app/menu.js', debug: false })
        .transform('babelify', { presets: ['@babel/preset-env'] })
        .bundle()
        .pipe(vinylSourceStream('scripts.js'))
        .pipe(vinylBuffer())
        .pipe(sourcemaps.init())
        // .pipe(uglifyjs())
        .pipe(rename('scripts.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./build/assets/js/main'))
        .pipe(server.stream());
});


gulp.task('build', function(done){
    run(
        'clean',
        'copy',
        'style',
        'images',
		'photos',
        'libs',
        'scripts',
        'html',
        'copy',
        done
    );
});



gulp.task('serve', function (){
    server.init({
        server: {
            baseDir: './build'
        }
    });

    gulp.watch('./dev/assets/sass/**/*.scss', ['style']);
    gulp.watch('./dev/**/*.html', ['html']);
    gulp.watch('./dev/assets/images/**/*.{png,jpg,svg}', ['images']);
	gulp.watch('./dev/assets/photos/**/*.{png,jpg,svg}', ['photos']);
    gulp.watch("./dev/assets/js/lib/*.js", ["lib"]);
    gulp.watch("./dev/assets/js/**/*.js", ["scripts"]);
});