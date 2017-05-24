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
const argument = require('../../lib/parser/argument');
const MODES = require('../../lib/parser/modes');

ava.test('isShortOption: should return true if mode is UNIX and argument is a UNIX short option', (test) => {
  test.true(argument.isShortOption('-x', {
    mode: MODES.UNIX
  }));
});

ava.test('isShortOption: should return false if mode is UNIX and argument is a UNIX long option', (test) => {
  test.false(argument.isShortOption('--hello', {
    mode: MODES.UNIX
  }));
});

ava.test('isShortOption: should return false if mode is UNIX and argument is a Windows short option', (test) => {
  test.false(argument.isShortOption('/x', {
    mode: MODES.UNIX
  }));
});

ava.test('isShortOption: should return false if mode is UNIX and argument is a Windows long option', (test) => {
  test.false(argument.isShortOption('/hello', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is an empty string', (test) => {
  test.false(argument.isOption('', {
    mode: MODES.UNIX
  }));
});

ava.test('isLongOption: should return false if mode is UNIX and argument is a UNIX short option', (test) => {
  test.false(argument.isLongOption('-x', {
    mode: MODES.UNIX
  }));
});

ava.test('isLongOption: should return true if mode is UNIX and argument is a UNIX long option', (test) => {
  test.true(argument.isLongOption('--hello', {
    mode: MODES.UNIX
  }));
});

ava.test('isLongOption: should return false if mode is UNIX and argument is a Windows short option', (test) => {
  test.false(argument.isLongOption('/x', {
    mode: MODES.UNIX
  }));
});

ava.test('isLongOption: should return false if mode is UNIX and argument is a Windows long option', (test) => {
  test.false(argument.isLongOption('/hello', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is an empty string', (test) => {
  test.false(argument.isOption('', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is a blank string', (test) => {
  test.false(argument.isOption('   ', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is undefined', (test) => {
  test.false(argument.isOption(undefined, {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is null', (test) => {
  test.false(argument.isOption(null, {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is a number', (test) => {
  test.false(argument.isOption(99, {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is a lowercase Windows short option', (test) => {
  test.false(argument.isOption('/x', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is a hyphen', (test) => {
  test.false(argument.isOption('-', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is two hyphens', (test) => {
  test.false(argument.isOption('--', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is a long option with one hyphen', (test) => {
  test.false(argument.isOption('-foo', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is an uppercase Windows short option', (test) => {
  test.false(argument.isOption('/A', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is a number Windows short option', (test) => {
  test.false(argument.isOption('/9', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is a lowercase UNIX short option', (test) => {
  test.true(argument.isOption('-x', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is an uppercase UNIX short option', (test) => {
  test.true(argument.isOption('-A', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is a number UNIX short option', (test) => {
  test.true(argument.isOption('-9', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is a lowercase UNIX long option', (test) => {
  test.true(argument.isOption('--foo', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is an uppercase UNIX long option', (test) => {
  test.true(argument.isOption('--HEY', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is a number UNIX long option', (test) => {
  test.true(argument.isOption('--945', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is a string UNIX long option containing hyphens', (test) => {
  test.true(argument.isOption('--foo-bar-baz', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is a string UNIX long option starting with three hyphens', (test) => {
  test.false(argument.isOption('---foo-bar-baz', {
    mode: MODES.UNIX
  }));
});

ava.test('getName: should return the name of a string UNIX short option if mode is UNIX', (test) => {
  test.is(argument.getName('-x', {
    mode: MODES.UNIX
  }), 'x');
});

ava.test('getName: should return the name of a number UNIX short option if mode is UNIX', (test) => {
  test.is(argument.getName('-0', {
    mode: MODES.UNIX
  }), '0');
});

ava.test('getName: should return the name of a string UNIX long option if mode is UNIX', (test) => {
  test.is(argument.getName('--foo', {
    mode: MODES.UNIX
  }), 'foo');
});

ava.test('getName: should return the name of a number UNIX long option if mode is UNIX', (test) => {
  test.is(argument.getName('--1452', {
    mode: MODES.UNIX
  }), '1452');
});

ava.test('getName: should return the same string given a Windows short option if mode is UNIX', (test) => {
  test.is(argument.getName('/x', {
    mode: MODES.UNIX
  }), '/x');
});

ava.test('getName: should return the same string given a Windows long option if mode is UNIX', (test) => {
  test.is(argument.getName('/foo', {
    mode: MODES.UNIX
  }), '/foo');
});

ava.test('getName: should return the same string if given a word', (test) => {
  test.is(argument.getName('hello', {
    mode: MODES.UNIX
  }), 'hello');
});
