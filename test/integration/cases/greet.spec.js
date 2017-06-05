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

assert('greet: should great a person with a one word name', [
  'greet',
  'John'
], {
  stdout: [
    'Hello, John'
  ],
  stderr: []
});

assert('greet: should great a person with prefix exclamation option', [
  '--exclamate',
  'greet',
  'John'
], {
  stdout: [
    'Hello, John!!!'
  ],
  stderr: []
});

assert('greet: should great a person with infix exclamation option', [
  'greet',
  '--exclamate',
  'John'
], {
  stdout: [
    'Hello, John!!!'
  ],
  stderr: []
});

assert('greet: should great a person with suffix exclamation option', [
  'greet',
  'John',
  '--exclamate'
], {
  stdout: [
    'Hello, John!!!'
  ],
  stderr: []
});

assert('greet: should great a person with exclamation option alias', [
  '-x',
  'greet',
  'John'
], {
  stdout: [
    'Hello, John!!!'
  ],
  stderr: []
});

assert('greet: should great a person without a name', [
  'greet'
], {
  stdout: [
    'Hello, human'
  ],
  stderr: []
});

assert('greet: should great a person without a name with exclamation', [
  'greet',
  '-e'
], {
  stdout: [
    'Hello, human!!!'
  ],
  stderr: []
});
