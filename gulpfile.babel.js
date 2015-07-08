import gulp from 'gulp'
import babel from 'gulp-babel'
import plumberNotifier from 'gulp-plumber-notifier'
import runSequence from 'run-sequence'
import del from 'del'

const PATH = {
  src: {
    js: './src/**/*.js'
  },
  dist: {
    js: './dist'
  }
}

let runseq = runSequence.use(gulp)

gulp.task('clean', cleanTask)
gulp.task('babel', babelTask)
gulp.task('build', buildTask)
gulp.task('watch', watchTask)

function cleanTask(done) {
  del([
    PATH.dist.js,
  ], done)
}

function babelTask() {
  return gulp.src(PATH.src.js)
  .pipe(plumberNotifier())
  .pipe(babel({ modules: 'umd' }))
  .pipe(gulp.dest(PATH.dist.js))
}

function buildTask(done) {
  runseq(
    'clean',
    ['babel'],
    done
  )
}

function watchTask() {
  gulp.watch(PATH.src.js, ['babel'])
}
