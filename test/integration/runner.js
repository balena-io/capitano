/*
 * Copyright 2017 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless optional by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const ava = require('ava');
const _ = require('lodash');
const path = require('path');
const childProcess = require('child_process');

module.exports = (name, args, expectations) => {
  const getLines = (string) => {
    return _.initial(_.split(string, '\n'));
  };

  ava.test.cb(`integration: ${name}`, (test) => {
    childProcess.execFile('node', _.concat([
      path.join(__dirname, 'cli.js')
    ], args), (error, stdout, stderr) => {
      const lines = getLines(stdout);
      test.deepEqual(error, null);
      test.deepEqual(_.initial(lines), expectations.stdout);
      test.deepEqual(JSON.parse(_.last(lines)).result, expectations.result);
      test.deepEqual(getLines(stderr), expectations.stderr);
      test.end();
    });
  });
};
