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

const assert = require('../runner');

assert('add: should add two positive integers', [
  'add',
  '1',
  '6'
], {
  stdout: [],
  stderr: [],
  result: 7,
  code: 0
});

assert('add: should add two positive floats', [
  'add',
  '3.51',
  '7.98'
], {
  stdout: [],
  stderr: [],
  result: 11.49,
  code: 0
});

assert('add: should exit if x is > 100', [
  'add',
  '101',
  '99'
], {
  stdout: [],
  stderr: [ 'The numbers are too big!' ],
  code: 1
});

assert('add: should exit if y is > 100', [
  'add',
  '99',
  '101'
], {
  stdout: [],
  stderr: [ 'The numbers are too big!' ],
  code: 1
});
