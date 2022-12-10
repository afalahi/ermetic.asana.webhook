/** @format */

import gulp from 'gulp';
import install from 'gulp-install';
import gulpTypScript from 'gulp-typescript';
import { deleteAsync } from 'del';
import sourcemaps from 'gulp-sourcemaps';
import zip from 'gulp-zip';

const tsProject = gulpTypScript.createProject('tsconfig.json');
//update in case of new dependencies
gulp.task('update', () =>
  gulp.src(['package.json'], { base: '.' }).pipe(install())
);

//clean everything inside of the dist directory. Directory will be created if not exits
gulp.task('clean', async () => await deleteAsync(['dist/*']));

//copy package.json and package-lock.json for clean install
gulp.task('copy', () =>
  gulp
    .src(['package.json', 'package-lock.json'], { base: '.' })
    .pipe(gulp.dest('dist'))
);
//transpile ts with sourcemaps and typings into the dist directory
gulp.task('transpile', () => {
  const tsResult = tsProject
    .src()
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(tsProject());
  return tsResult.pipe(sourcemaps.write('.')).pipe(gulp.dest('dist'));
});
//install dependencies in the dist directory to prepare for binary build
gulp.task('install', () =>
  gulp
    .src('dist/package.json', { base: 'dist' })
    .pipe(install({ npm: '--omit=dev' }))
);
gulp.task('zip', () => {
  return gulp.src('dist/**/*').pipe(zip('index.zip')).pipe(gulp.dest('dist'));
});
//run tasks in sequence
gulp.task(
  'default',
  gulp.series('update', 'clean', 'copy', 'transpile', 'install', 'zip')
);
