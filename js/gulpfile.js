const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const path = require('path');

function includeHTML() {
    return gulp.src(['./*.html', '!./partials/*.html']) // Exclude partials from being processed
        .pipe(fileInclude({
            prefix: '@@',
            basepath: './partials'
        }))
        .pipe(gulp.dest('./'));
}

exports.default = includeHTML;
