'use strict';

var cpFork = require('child_process').fork;
var path = require('path');
var gulp = require('gulp');
var gulpPlugins = require('gulp-load-plugins')();
var serverChildProc ;

var projectPaths = {
  server: [path.join(__dirname, 'dev/**/*'), '!' + path.join(__dirname, 'dev/public/**/*')],
  browser: path.join(__dirname, 'dev/public/**/*')
};

gulp.task('default', function () {
  gulpPlugins.util.log('I don\'t have a default task because you haven\'t defined any and I don\'t want to make any assumption');
});

gulp.task('server', function (next) {
  function startServer() {
    serverChildProc = cpFork('./runDevServer');
    serverChildProc.on('message', function (message) {
      if ('listening' === message.event) {
        gulpPlugins.livereload.changed();
        next();
      }

      if ('error' === message.event)  {
        gulpPlugins.util.log(gulpPlugins.util.colors.red('Error on start server:', message.details));
      }
    });
    serverChildProc.send('start');
  }

  if (serverChildProc) {
    serverChildProc.on('message', function (message) {
      if ('closed' === message.event) {
        serverChildProc.kill('SIGTERM');
      }

      if ('error' === message.event)  {
        gulpPlugins.util.log(gulpPlugins.util.colors.red('Error on start server:', message.details));
      }
    });
    serverChildProc.on('exit', startServer);
    serverChildProc.send('close');
  } else {
    startServer();
  }
});

gulp.task('jslint', function () {
  return gulp.src(['dev/**/*.js'])
  .pipe(gulpPlugins.eslint())
  .pipe(gulpPlugins.eslint.format());
});

gulp.task('dev', ['jslint', 'server'], function (next) {
  gulpPlugins.livereload.listen();
  gulp.watch(projectPaths.server, ['server', 'jslint']);
  gulp.watch(projectPaths.browser, gulpPlugins.livereload.changed);
});
