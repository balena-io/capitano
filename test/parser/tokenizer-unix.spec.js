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

ava.test('isShortOption: should return true if mode is UNIX and argument is a UNIX short option', (test) => {
  test.true(tokenizer.isShortOption('-x', {
    mode: MODES.UNIX
  }));
});

ava.test('isShortOption: should return false if mode is UNIX and argument is a UNIX long option', (test) => {
  test.false(tokenizer.isShortOption('--hello', {
    mode: MODES.UNIX
  }));
});

ava.test('isShortOption: should return false if mode is UNIX and argument is a Windows short option', (test) => {
  test.false(tokenizer.isShortOption('/x', {
    mode: MODES.UNIX
  }));
});

ava.test('isShortOption: should return false if mode is UNIX and argument is a Windows long option', (test) => {
  test.false(tokenizer.isShortOption('/hello', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is an empty string', (test) => {
  test.false(tokenizer.isOption('', {
    mode: MODES.UNIX
  }));
});

ava.test('isLongOption: should return false if mode is UNIX and argument is a UNIX short option', (test) => {
  test.false(tokenizer.isLongOption('-x', {
    mode: MODES.UNIX
  }));
});

ava.test('isLongOption: should return true if mode is UNIX and argument is a UNIX long option', (test) => {
  test.true(tokenizer.isLongOption('--hello', {
    mode: MODES.UNIX
  }));
});

ava.test('isLongOption: should return false if mode is UNIX and argument is a Windows short option', (test) => {
  test.false(tokenizer.isLongOption('/x', {
    mode: MODES.UNIX
  }));
});

ava.test('isLongOption: should return false if mode is UNIX and argument is a Windows long option', (test) => {
  test.false(tokenizer.isLongOption('/hello', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is an empty string', (test) => {
  test.false(tokenizer.isOption('', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is a blank string', (test) => {
  test.false(tokenizer.isOption('   ', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is undefined', (test) => {
  test.false(tokenizer.isOption(undefined, {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is null', (test) => {
  test.false(tokenizer.isOption(null, {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is a number', (test) => {
  test.false(tokenizer.isOption(99, {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is a lowercase Windows short option', (test) => {
  test.false(tokenizer.isOption('/x', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is a hyphen', (test) => {
  test.false(tokenizer.isOption('-', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is two hyphens', (test) => {
  test.false(tokenizer.isOption('-', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is a long option with one hyphen', (test) => {
  test.false(tokenizer.isOption('-foo', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is an uppercase Windows short option', (test) => {
  test.false(tokenizer.isOption('/A', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is a number Windows short option', (test) => {
  test.false(tokenizer.isOption('/9', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is a lowercase UNIX short option', (test) => {
  test.true(tokenizer.isOption('-x', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is an uppercase UNIX short option', (test) => {
  test.true(tokenizer.isOption('-A', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is a number UNIX short option', (test) => {
  test.true(tokenizer.isOption('-9', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is a lowercase UNIX long option', (test) => {
  test.true(tokenizer.isOption('--foo', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is an uppercase UNIX long option', (test) => {
  test.true(tokenizer.isOption('--HEY', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is a number UNIX long option', (test) => {
  test.true(tokenizer.isOption('--945', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return true if mode is UNIX and argument is a string UNIX long option containing hyphens', (test) => {
  test.true(tokenizer.isOption('--foo-bar-baz', {
    mode: MODES.UNIX
  }));
});

ava.test('isOption: should return false if mode is UNIX and argument is a string UNIX long option starting with three hyphens', (test) => {
  test.false(tokenizer.isOption('---foo-bar-baz', {
    mode: MODES.UNIX
  }));
});

ava.test('getArgumentName: should return the name of a string UNIX short option if mode is UNIX', (test) => {
  test.is(tokenizer.getArgumentName('-x', {
    mode: MODES.UNIX
  }), 'x');
});

ava.test('getArgumentName: should return the name of a number UNIX short option if mode is UNIX', (test) => {
  test.is(tokenizer.getArgumentName('-0', {
    mode: MODES.UNIX
  }), '0');
});

ava.test('getArgumentName: should return the name of a string UNIX long option if mode is UNIX', (test) => {
  test.is(tokenizer.getArgumentName('--foo', {
    mode: MODES.UNIX
  }), 'foo');
});

ava.test('getArgumentName: should return the name of a number UNIX long option if mode is UNIX', (test) => {
  test.is(tokenizer.getArgumentName('--1452', {
    mode: MODES.UNIX
  }), '1452');
});

ava.test('getArgumentName: should return the same string given a Windows short option if mode is UNIX', (test) => {
  test.is(tokenizer.getArgumentName('/x', {
    mode: MODES.UNIX
  }), '/x');
});

ava.test('getArgumentName: should return the same string given a Windows long option if mode is UNIX', (test) => {
  test.is(tokenizer.getArgumentName('/foo', {
    mode: MODES.UNIX
  }), '/foo');
});

ava.test('getArgumentName: should return the same string if given a word', (test) => {
  test.is(tokenizer.getArgumentName('hello', {
    mode: MODES.UNIX
  }), 'hello');
});

ava.test('getArgumentType: should return OPTION given a UNIX short option and mode if UNIX', (test) => {
  test.is(tokenizer.getArgumentType('-x', {
    mode: MODES.UNIX
  }), tokenizer.TYPES.OPTION);
});

ava.test('getArgumentType: should return OPTION given a UNIX long option and mode if UNIX', (test) => {
  test.is(tokenizer.getArgumentType('--foo', {
    mode: MODES.UNIX
  }), tokenizer.TYPES.OPTION);
});

ava.test('getArgumentType: should return WORD given a Windows short option and mode if UNIX', (test) => {
  test.is(tokenizer.getArgumentType('/x', {
    mode: MODES.UNIX
  }), tokenizer.TYPES.WORD);
});

ava.test('getArgumentType: should return WORD given a Windows long option and mode if UNIX', (test) => {
  test.is(tokenizer.getArgumentType('/foo', {
    mode: MODES.UNIX
  }), tokenizer.TYPES.WORD);
});

ava.test('getArgumentType: should return WORD given a word and mode if UNIX', (test) => {
  test.is(tokenizer.getArgumentType('foo', {
    mode: MODES.UNIX
  }), tokenizer.TYPES.WORD);
});

ava.test('tokenize: should tokenize a single boolean UNIX short option', (test) => {
  test.deepEqual(tokenizer.tokenize([ '-x' ], {
    mode: MODES.UNIX
  }), [
    {
      type: tokenizer.TYPES.OPTION,
      name: 'x'
    }
  ]);
});

ava.test('tokenize: should tokenize a single boolean UNIX long option', (test) => {
  test.deepEqual(tokenizer.tokenize([ '--foo' ], {
    mode: MODES.UNIX
  }), [
    {
      type: tokenizer.TYPES.OPTION,
      name: 'foo'
    }
  ]);
});

ava.test('tokenize: should tokenize a complex set of UNIX arguments', (test) => {
  test.deepEqual(tokenizer.tokenize([ 'flash', '-c', '--drive', '/dev/disk2', '-y' ], {
    mode: MODES.UNIX
  }), [
    {
      type: tokenizer.TYPES.WORD,
      name: 'flash'
    },
    {
      type: tokenizer.TYPES.OPTION,
      name: 'c'
    },
    {
      type: tokenizer.TYPES.OPTION,
      name: 'drive'
    },
    {
      type: tokenizer.TYPES.WORD,
      name: '/dev/disk2'
    },
    {
      type: tokenizer.TYPES.OPTION,
      name: 'y'
    }
  ]);
});

ava.test('tokenize: should tokenize Windows options as WORDs', (test) => {
  test.deepEqual(tokenizer.tokenize([ '/x', '/foo' ], {
    mode: MODES.UNIX
  }), [
    {
      type: tokenizer.TYPES.WORD,
      name: '/x'
    },
    {
      type: tokenizer.TYPES.WORD,
      name: '/foo'
    }
  ]);
});
