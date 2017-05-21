var gulp = require('gulp'),
        uglify = require('gulp-uglify'),
        clean = require('gulp-clean'),
        zip = require('gulp-zip'),
        bump = require('gulp-bump'),
        runSequence = require('run-sequence');

var BUILD_PATH = 'build',
        DIST_PATH = 'dist',
        SOURCE_PATH = '.',
        RELEASE_VERSION = '0.0.1';

gulp.task('deploy', function (callback) {
    runSequence('clean',
            'build',
            'set_version',
            'generate_artifacts');
});

gulp.task('clean', function () {
    console.log("Clean all files in build and dist folders");
    return gulp.src([BUILD_PATH + '/*', DIST_PATH + '/*'], {
        read: false
    }).pipe(clean());
});

gulp.task('generate_artifacts', function () {
    console.log('Packaging all project files to zip');
    return gulp.src(BUILD_PATH + '/**')
            .pipe(zip('omsklug-image-' + RELEASE_VERSION + '.zip'))
            .pipe(gulp.dest(DIST_PATH));
});

function build() {
    console.log("Copying project to build folder");
    return gulp.src([SOURCE_PATH + '/**',
        '!' + SOURCE_PATH + '/node_modules',
        '!' + SOURCE_PATH + '/node_modules/**',
        '!' + SOURCE_PATH + '/build',
        '!' + SOURCE_PATH + '/build/**',
        '!' + SOURCE_PATH + '/dist',
        '!' + SOURCE_PATH + '/dist/**',
        '!' + SOURCE_PATH + '/nbproject',
        '!' + SOURCE_PATH + '/nbproject/**'
    ], {
        base: '.'
    }).pipe(gulp.dest('build'));
}

gulp.task('build', build);

gulp.task('set_version', function () {
    gulp.src("./package.json")
            .pipe(bump({
                version: RELEASE_VERSION
            }))
            .pipe(gulp.dest('./' + BUILD_PATH));
});

gulp.task('default', function () {
    console.log("default");
});
