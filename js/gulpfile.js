const gulp = require('gulp');
const fileInclude = require('gulp-file-include');

gulp.task('file-include', async function() {
  gulp.src(['./src/**/*.html', '!./src/partials/**'])
    .pipe(fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', gulp.series('file-include'));
