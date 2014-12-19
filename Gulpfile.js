var gulp      = require('gulp');
var rename    = require('gulp-rename');
var minifycss = require('gulp-minify-css');
var coffee    = require('gulp-coffee');
var concat    = require('gulp-concat');
var uglify    = require('gulp-uglify');

gulp.task('default', ['js', 'css', 'copyExamples']);

gulp.task('js', function() {
  gulp.src(['src/js/tape-calculator.coffee', 'src/js/ng-tape-calculator.coffee'])
    .pipe(coffee())
    .pipe(concat('ng-tape-calculator.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
  return gulp.src('src/css/tape-calculator.css')
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist')); 
});

gulp.task('copyExamples', ['js', 'css'], function() {
    gulp.src(['dist/ng-tape-calculator.js', 'dist/tape-calculator.css'])
      .pipe(gulp.dest('examples'));
});

gulp.task('watch', function() {
  gulp.watch('src/**/*', ['default']);
});
