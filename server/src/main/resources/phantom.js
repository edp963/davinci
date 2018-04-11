"use strict";
var page = require('webpage').create();
var system = require('system');
var pageUrl = system.args[1];
var picName = system.args[2];

page.viewportSize = { width: 1920, height: 1080 };

page.open(pageUrl, function (status) {
  if (status !== 'success') {
    phantom.exit();
  } else {
    waitFor(function () {
      return page.evaluate(function () {
        return !!document.getElementById('phantomRenderSign');
      });
    }, function () {
      page.render(picName)
      phantom.exit();
    }, 120000);
  }
});

function waitFor(testFx, onReady, timeOutMillis) {
  var start = new Date().getTime();
  var condition = false;
  var interval = setInterval(function () {
    var elapsedTime = new Date().getTime() - start;

    if ((elapsedTime < timeOutMillis) && !condition) {
      condition = testFx();
    } else {
      if (!condition) {
        phantom.exit(1);
      } else {
        onReady();
        clearInterval(interval);
      }
    }
  }, 1000);
}
