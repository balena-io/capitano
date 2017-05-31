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
const MODES = require('../../lib/parser/modes');

ava.test('should be a plain object', (test) => {
  test.true(_.isPlainObject(MODES));
});

ava.test('every property should contain an optionShort regex', (test) => {
  _.each(MODES, (value) => {
    test.true(_.isRegExp(value.optionShort));
  });
});

ava.test('every property should contain an optionLong regex', (test) => {
  _.each(MODES, (value) => {
    test.true(_.isRegExp(value.optionLong));
  });
});

ava.test('every property should contain an endOfParameterSymbol string', (test) => {
  _.each(MODES, (value) => {
    test.true(_.isString(value.endOfParameterSymbol));
  });
});

ava.test('every property should contain an optionToString function', (test) => {
  _.each(MODES, (value) => {
    test.true(_.isFunction(value.optionToString));
  });
});
