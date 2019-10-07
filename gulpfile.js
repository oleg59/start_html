var gulp          = require('gulp'),
	gutil         = require('gulp-util' ),
	sass          = require('gulp-sass'),
	browsersync   = require('browser-sync'),
	concat        = require('gulp-concat'),
	uglify        = require('gulp-uglify'),
	cleancss      = require('gulp-clean-css'),
	rename        = require('gulp-rename'),
	autoprefixer  = require('gulp-autoprefixer'),
	notify        = require("gulp-notify"),
	del           = require('del'),
	ftp           = require('vinyl-ftp'),
	pug           = require('gulp-pug');

gulp.task('browser-sync', function() {
	browsersync({
		server: {
			baseDir: 'build'
		},
		ghostMode: false,
		notify: false,
		// open: false,
		// tunnel: true,
		// tunnel: "projectname", //Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('sass', function() {
	return gulp.src('app/sass/**/*.sass')
		.pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
		.pipe(rename({ suffix: '.min', prefix : '' }))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
		.pipe(gulp.dest('build/css'))
		.pipe(browsersync.reload( {stream: true} ))
});

gulp.task('js', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/libs/slick-carousel/slick/slick.min.js',
		'app/libs/fancybox/dist/jquery.fancybox.min.js',
		'app/js/common.js', // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('build/js'))
	.pipe(browsersync.reload({ stream: true }))
});

gulp.task('pug', function () {
	return gulp.src([
		'!app/pug/blocks/**/*',
		'!app/pug/layouts/**/*',
		'app/pug/**/*.pug'
	])
		.pipe(pug({
			pretty: true
		}).on("error", notify.onError()))
		.pipe(gulp.dest('build'));
});

gulp.task('watch', ['build', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/pug/**/*.pug', ['pug']);
	gulp.watch(['app/libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch('build/*.html', browsersync.reload);
	gulp.watch('app/assets/**/*', ['assets'], browsersync.reload);
});

gulp.task('assets', function() {
	gulp.src(['app/assets/**',]).pipe(gulp.dest('build'));
});

gulp.task('build', ['removebuild', 'assets', 'sass', 'js', 'pug']);

gulp.task('deploy', function() {
	var conn = ftp.create({
		host:      '{{HOST}}',
		user:      '{{USER}}',
		password:  '{{PASSWORD}}',
		parallel:  10,
		log: gutil.log
	});

	var globs = ['build/**'];
	return gulp.src(globs, {buffer: false})
		.pipe(conn.dest('/'));

});

gulp.task('removebuild', function() { return del.sync('build'); });

gulp.task('default', ['build', 'watch']);
