/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2019 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

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
