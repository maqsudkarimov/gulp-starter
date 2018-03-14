'use strict';

var gulp 		= require('gulp'),
	$ 	 		= require('gulp-load-plugins')(),
	browserSync = require('browser-sync').create(),
	reload 		= browserSync.reload,
	del	 		= require('del'),
	runSequence	= require('run-sequence'),
	prettify 	= require('gulp-html-prettify'),
	beautify 	= require('gulp-jsbeautify'),
	archiver 	= require('gulp-archiver'),
	babel 		= require('gulp-babel');

var config = {
	dist: 'dist/',
	src: 'src/',
	tmp: '.tmp',

	styles: 'src/styles',
	stylesIn: 'src/styles/**/*.scss',
	stylesTmpOut: '.tmp/styles',
	stylesOut: 'dist/styles',

	scripts: 'src/scripts',
	scriptsIn: 'src/scripts/**/*.js',
	scriptsTmpOut: '.tmp/scripts',
	scriptsOut: 'dist/scripts',

	imageIn: 'src/images/**/*',
	imageOut: 'dist/images',

	templatePath: 'src/tpl',
	pagesPath: 'src/tpl/pages/**/*.html',
	layoutsPath: 'src/tpl/layouts'

};

gulp.task('styles', function () {

	return gulp.src( config.stylesIn )
		.pipe($.plumber())
		.pipe($.sass.sync({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['.']
		}).on('error', $.sass.logError))
		.pipe($.autoprefixer({ browsers: ['last 100 versions'] }))
		.pipe(gulp.dest( config.stylesTmpOut ))
		.pipe(reload({ stream: true }));

});

gulp.task('styles-build', function () {

	return gulp.src( config.stylesIn )
		.pipe($.plumber())
		.pipe($.sass.sync({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['.']
		}).on('error', $.sass.logError))
		.pipe($.autoprefixer({ browsers: ['last 10 versions'] }))
		.pipe($.cssnano({ safe: true, autoprefixer: false }))
		.pipe(gulp.dest( config.stylesOut ))
		.pipe(reload({ stream: true }));

});

gulp.task('scripts', function () {

	return gulp.src( config.scriptsIn )
		.pipe($.plumber())
		.pipe(babel({
			"presets": ["es2015"]
		}))
		.pipe(beautify({indentSize: 4}))
		.pipe(gulp.dest( config.scriptsTmpOut ))
		.pipe(reload({ stream: true }));

});

gulp.task('image-min', function () {

	return gulp.src( config.imageIn )
		.pipe($.imagemin({
			interlaced: true,
			progressive: true,
			optimizationLevel: 5,
			svgoPlugins: [{removeViewBox: true}]
		}))
		.pipe(gulp.dest( config.imageOut ));

});

gulp.task('nunjucks', function () {

	return gulp.src( config.pagesPath )
		.pipe($.plumber())
		.pipe($.nunjucksRender({
			path: [ config.layoutsPath ]
		}))
		.pipe(gulp.dest( config.tmp ));

});

gulp.task('htmlmin', ['styles', 'nunjucks'], function () {

	return gulp.src('.tmp/*.html')
		.pipe($.useref({ searchPath: [ config.tmp, config.src, '.'] }))
		.pipe($.if(/\.js$/, $.uglify({ compress: { drop_console: true } })))
		.pipe($.if(/\.css$/, $.cssnano({ safe: true, autoprefixer: false })))
		.pipe($.if(/\.html$/, $.htmlmin({
			collapseWhitespace: true,
			minifyCSS: true,
			minifyJS: { compress: { drop_console: true } },
			processConditionalComments: true,
			removeComments: true,
			removeEmptyAttributes: true,
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true
		})))
		.pipe($.if(/\.html$/, prettify({ indent_char: ' ', indent_size: 4 })))
		.pipe(gulp.dest( config.dist ));

});

gulp.task('html', ['styles', 'scripts', 'nunjucks'], function () {

	return gulp.src('.tmp/*.html')
		.pipe($.useref({ searchPath: [ config.tmp, config.src, '.' ] }))
		.pipe($.if(/\.js$/, beautify({indentSize: 4})))
		.pipe($.if(/\.html$/, $.htmlmin({
			collapseWhitespace: true,
			minifyCSS: true,
			minifyJS: { compress: { drop_console: true } },
			processConditionalComments: true,
			removeComments: true,
			removeEmptyAttributes: true,
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true
		})))
		.pipe($.if(/\.html$/, prettify({ indent_char: ' ', indent_size: 4 })))
		.pipe(gulp.dest( config.dist ));

});

gulp.task('serve', function () {

	runSequence(['clean'], ['styles', 'scripts', 'nunjucks'], function () {

		browserSync.init({
			notify: false,
			port: 9000,
			server: {
				baseDir: [ config.tmp, config.src ],
			}
		});

		gulp.watch([ config.templatePath + '/**/*']).on('change', reload);
		gulp.watch( config.templatePath + '/**/*', ['nunjucks', 'pages-list:tmp']);
		gulp.watch( config.stylesIn, ['styles']);
		gulp.watch( config.scriptsIn, ['scripts']);

	});

});

gulp.task('move', function () {

	return gulp.src([
		'src/**/*',
		'!src/styles/*',
		'!src/scripts/*',
		'!src/tpl',
		'!src/libs'
	], {
		dot: true
	}).pipe( gulp.dest( config.dist ) );

});

gulp.task('build', function () {

	runSequence(['clean'], ['htmlmin', 'image-min', 'move'], function () {

		return gulp.src( config.dist + '**' )
			.pipe( archiver('archive.zip') )
			.pipe( gulp.dest( config.dist) );

	});
});

gulp.task('build-css', ['styles-build']);

gulp.task('clean', del.bind(null, [ config.tmp, config.dist ] ) );