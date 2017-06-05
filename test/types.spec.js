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
const types = require('../lib/types');

ava.test('supported: should be a plain object', (test) => {
  test.true(_.isPlainObject(types.supported));
});

ava.test('supported: every property should contain a string', (test) => {
  test.true(_.every(_.values(types.supported), _.isString));
});

ava.test('supported: every property should be unique', (test) => {
  test.is(_.size(_.uniq(_.values(types.supported))), _.size(_.values(types.supported)));
});

ava.test('isSupported: should return true if type is string', (test) => {
  test.true(types.isSupported(types.supported.STRING));
});

ava.test('isSupported: should return true if type is number', (test) => {
  test.true(types.isSupported(types.supported.NUMBER));
});

ava.test('isSupported: should return true if type is boolean', (test) => {
  test.true(types.isSupported(types.supported.BOOLEAN));
});

ava.test('isSupported: should return false if type is not supported', (test) => {
  test.false(types.isSupported('hello'));
});

ava.test('matches: should return true if type is string and value is string', (test) => {
  test.true(types.matches(types.supported.STRING, 'foo'));
});

ava.test('matches: should return false if type is string and value is number', (test) => {
  test.false(types.matches(types.supported.STRING, 1));
});

ava.test('matches: should return false if type is string and value is boolean', (test) => {
  test.false(types.matches(types.supported.STRING, false));
});

ava.test('matches: should return false if type is number and value is string', (test) => {
  test.false(types.matches(types.supported.NUMBER, 'foo'));
});

ava.test('matches: should return true if type is number and value is number', (test) => {
  test.true(types.matches(types.supported.NUMBER, 1));
});

ava.test('matches: should return false if type is number and value is boolean', (test) => {
  test.false(types.matches(types.supported.NUMBER, false));
});

ava.test('matches: should return false if type is boolean and value is string', (test) => {
  test.false(types.matches(types.supported.BOOLEAN, 'foo'));
});

ava.test('matches: should return false if type is boolean and value is number', (test) => {
  test.false(types.matches(types.supported.BOOLEAN, 1));
});

ava.test('matches: should return false if type is boolean and value is boolean', (test) => {
  test.true(types.matches(types.supported.BOOLEAN, false));
});

ava.test('matches: should return false if type is unknown', (test) => {
  test.false(types.matches('foo', 'bar'));
});
