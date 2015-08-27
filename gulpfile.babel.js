import del from 'del'
import gulp from 'gulp'
import Run from 'run-sequence'
import tasks from 'easy-gulp-task'

let run = Run.use(gulp)

gulp.task('babel', tasks.babel({ babel: { optional: ['runtime'] } }))
gulp.task('build', buildTask)
gulp.task('clean', cleanTask)
gulp.task('watch', tasks.watch({ babel: () => run('babel') }))

function cleanTask(done) {
  del('./dist', done)
}

function buildTask(done) {
  run(
    'clean',
    ['babel'],
    done
  )
}
