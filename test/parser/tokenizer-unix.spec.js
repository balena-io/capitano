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
const tokenizer = require('../../lib/parser/tokenizer');
const MODES = require('../../lib/parser/modes');

ava.test('should return false if mode is UNIX and argument is an empty string', (test) => {
  test.false(tokenizer.isOption('', {
    mode: MODES.UNIX
  }));
});

ava.test('should return false if mode is UNIX and argument is a blank string', (test) => {
  test.false(tokenizer.isOption('   ', {
    mode: MODES.UNIX
  }));
});

ava.test('should return false if mode is UNIX and argument is undefined', (test) => {
  test.false(tokenizer.isOption(undefined, {
    mode: MODES.UNIX
  }));
});

ava.test('should return false if mode is UNIX and argument is null', (test) => {
  test.false(tokenizer.isOption(null, {
    mode: MODES.UNIX
  }));
});

ava.test('should return false if mode is UNIX and argument is a number', (test) => {
  test.false(tokenizer.isOption(99, {
    mode: MODES.UNIX
  }));
});

ava.test('should return true if mode is UNIX and argument is a lowercase Windows short option', (test) => {
  test.false(tokenizer.isOption('/x', {
    mode: MODES.UNIX
  }));
});

ava.test('should return true if mode is UNIX and argument is a hyphen', (test) => {
  test.false(tokenizer.isOption('-', {
    mode: MODES.UNIX
  }));
});

ava.test('should return true if mode is UNIX and argument is two hyphens', (test) => {
  test.false(tokenizer.isOption('-', {
    mode: MODES.UNIX
  }));
});

ava.test('should return false if mode is UNIX and argument is a long option with one hyphen', (test) => {
  test.false(tokenizer.isOption('-foo', {
    mode: MODES.UNIX
  }));
});

ava.test('should return true if mode is UNIX and argument is an uppercase Windows short option', (test) => {
  test.false(tokenizer.isOption('/A', {
    mode: MODES.UNIX
  }));
});

ava.test('should return true if mode is UNIX and argument is a number Windows short option', (test) => {
  test.false(tokenizer.isOption('/9', {
    mode: MODES.UNIX
  }));
});

ava.test('should return true if mode is UNIX and argument is a lowercase short option', (test) => {
  test.true(tokenizer.isOption('-x', {
    mode: MODES.UNIX
  }));
});

ava.test('should return true if mode is UNIX and argument is an uppercase short option', (test) => {
  test.true(tokenizer.isOption('-A', {
    mode: MODES.UNIX
  }));
});

ava.test('should return true if mode is UNIX and argument is a number short option', (test) => {
  test.true(tokenizer.isOption('-9', {
    mode: MODES.UNIX
  }));
});

ava.test('should return true if mode is UNIX and argument is a lowercase long option', (test) => {
  test.true(tokenizer.isOption('--foo', {
    mode: MODES.UNIX
  }));
});

ava.test('should return true if mode is UNIX and argument is an uppercase long option', (test) => {
  test.true(tokenizer.isOption('--HEY', {
    mode: MODES.UNIX
  }));
});

ava.test('should return true if mode is UNIX and argument is a number long option', (test) => {
  test.true(tokenizer.isOption('--945', {
    mode: MODES.UNIX
  }));
});
