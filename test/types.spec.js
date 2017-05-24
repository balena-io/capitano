/*
 * Copyright 2017 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const ava = require('ava');
const _ = require('lodash');
const TYPES = require('../lib/types');

ava.test('should be a plain object', (test) => {
  test.true(_.isPlainObject(TYPES));
});

ava.test('every property should contain a string', (test) => {
  test.true(_.every(_.values(TYPES), _.isString));
});

ava.test('every property should be unique', (test) => {
  test.is(_.size(_.uniq(_.values(TYPES))), _.size(_.values(TYPES)));
});
