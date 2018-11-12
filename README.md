Capitano
========

[![npm version](https://badge.fury.io/js/capitano.svg)](http://badge.fury.io/js/capitano)
[![dependencies](https://david-dm.org/resin-io/capitano.png)](https://david-dm.org/username/repo.png)
[![Build Status](https://travis-ci.org/resin-io/capitano.svg?branch=master)](https://travis-ci.org/resin-io/capitano)
[![Build status](https://ci.appveyor.com/api/projects/status/fatwdf74xeh8j9ee?svg=true)](https://ci.appveyor.com/project/jviotti/capitano)

Join our online chat at [![Gitter chat](https://badges.gitter.im/resin-io/chat.png)](https://gitter.im/resin-io/chat)

Capitano allows you to craft powerful command line applications, your way.

```coffee
capitano = require('capitano')

capitano.permission 'jviotti', (done) ->
	return done() if process.env.USER is 'jviotti'
	done(new Error('You are not jviotti!'))

capitano.command
	signature: 'utils print <title> [words...]'
	options: [
		signature: 'date'
		boolean: true
		alias: [ 'd' ]
	]
	permission: 'jviotti'
	action: (params, options) ->
		log = ''

		if options.date
			log += "#{new Date()} "

		log += "#{params.title}: #{params.words}"

		console.log(log)

capitano.command
	signature: '*'
	description: 'Default command that will run when no command is passed'
	action: someFunction

capitano.run process.argv, (error) ->
	throw error if error?
```

***

```sh
$ myCoolApp utils print Error Something very bad happened
Error: Something very bad happened

$ myCoolApp utils print Error Something very bad happened -d
Thu Dec 18 2014 14:49:27 GMT-0400 (BOT) Error: Something very bad happened
```

We wrote Capitano as we couldn't find any NodeJS command line parser that met our needs. Alternatives such as [commander.js](https://github.com/tj/commander.js), albeit being very good, didn't have good support for features such as infinitely nested git-like subcommands, per-command options and complete customisation. Capitano is our attempt at creating a non-opinionated command line parser that can do everything you can imagine.

Features
--------

- Infinitely nested git-like subcommands.
- Global and per-command options.
- Variadic arguments.
- Option aliases.
- Stdin support out of the box.
- Separate between parsing and executing command line arguments.
- No built-in generated help page, you roll your own.
- No built-in commands, you have a high degree of control over your app.
- Permission support.

Installation
------------

Install `capitano` by running:

```sh
$ npm install --save capitano
```

API
-------

## capitano.command(options)

Register a command. Capitano understands the following options, but you can pass custom options to do nifty things (see the [examples section](https://github.com/resin-io/capitano#examples)):

### signature (string)

The command signature. If it's `*`, it will match anything that is not matched by other commands.

You can represent a command that allows input from stdin with the following syntax:

- Required: `<|foo>`.
- Optional: `[|foo]`.

Notice that you can only have **one** stdin command per signature, and it has to be the **last parameter** of the signature. See the [examples section](https://github.com/resin-io/capitano#examples) for a stdin example.

### action (function)

Function to call when the signature is matched. This function gets passed a parameter object, an options object and a `callback` to be called when the action is finished.

If the `callback` argument is not declared in the action function, it'll be called implicitly, however in order to ensure Capitano works as expected, call the `callback` function if your action is async.
Capitano uses the `action.length` property to determine whether the `action` function declares the `callback` argument.
This doesn't work with [default function parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters),
so please avoid using default parameters when implementing your `action` function.

### options ([object])

Array of objects describing the options specific to this command. See the [options section](https://github.com/resin-io/capitano#option) for more information.

### permission (string)

Require a certain previously registered permission by name. If the permission requirements are not met, the command action will not be called and `capitano.execute()`, or `capitano.run()` will get the error you passed in from the permission function in their callbacks.

Notice that Capitano doesn't currently supports passing an array of permissions. If you have that specific use case, you'll have to create a new permission that combines the other ones.

### root (boolean)

If you specify this option to true, then the command will only be runnable by a user with admin privileges, or prefixed by `sudo`.

## capitano.globalOption(options)

Register a global option, which will be accessible from every command (and from outside too!) so be careful about naming collisions!

It accepts an object containing the following options:

### signature (string)

The option signature **excluding** any parameter (`foo` instead of `foo <bar>`).

### boolean (boolean)

Whether the option is boolean (doesn't accepts any parameters). It defaults to `false`. If `parameter` is defined, then `boolean` should be `false`.

### parameter (string)

The name of the parameter, excluding required/optional tags (`bar` instead of `<bar>`). Notice that if you set `boolean: true`, then you have to omit this option.

### alias (string|[string])

Define an alias, or a set of alias for an option. Aliases can contain single letter abbreviations (`f`, `l`) or full option names (`baz`, `foo`).

## capitano.permission(name, function)

It registers a permission function under a certain name. The permission function is passed a `done()` function that accepts an error instance in case the user doesn't fits the permission requirements. Pass nothing if the permission requirement was matched.

**Note:** You must call the `done()` function, even if your permission function is synchronous, in order for Capitano to continue.

## capitano.run(argv, callback)

Run and execute the application given a set of arguments (usually `process.argv`):

```coffee
capitano.run(process.argv)
```

This is also the command you need to use if you need to call a command from another command. For example:

```coffee
capitano.run('my other command --foo bar', callback)
```

**Note:** `capitano.run` is a shorcut function for `capitano.execute(capitano.parse(argv), callback)`. You will usually use this function, however you can use `parse()` and `execute()` in particular situations when you need to differenciate between parsing and executing the commands.

## capitano.parse(argv)

Parse, but not execute the command line arguments (usually `process.argv`).

It returns a `cli` object containing three fields:

### command (string)

A string representing the issued command, omitting any option.

### options (object)

An object containing the raw representation of the given options.

### global (object)

An object containing the matches and parsed global options.

## capitano.execute(cli, callback)

It accepts a `cli` object (returned by [capitano.parse()](https://github.com/resin-io/capitano#capitanoparseargv)) and
executes the corresponding command, with it's corresponding options.

You're expected to provide your own error handling mechanism here, or in the `capitano.run` if executing from there.

## capitano.state

An object containing the current registered commands an options. As with Capitano you're expected to implement every command (including `help`, etc) this object comes handy to accomplish a wide range of tasks.

It includes the following fields:

### commands (array)

An array containing every registered command so far (with `capitano.command()`)

See the [Command class](https://github.com/resin-io/capitano#command) for more information.

### globalOptions (array)

An array containing every registered global option so far (with `capitano.globalOption()`).

See the [Option class](https://github.com/resin-io/capitano#option) for more information.

### findCommandBySignature(signature)

A self explanatory function that returns a command that matches a specific signature.

### getMatchCommand(signature, callback)

Get command that matches a signature, without taking parameters into account.

This means that a command `app create <id>` will be matched by a signature `app create`.

## capitano.defaults

An object containing some settings used by Capitano.

It includes the following fields:

- `signatures.wildcard (string)` The wildcard symbol. Defaults to `*`.
- `actions.commandNotFound(signature)` The function called when a command was not found. By default, it prints a boring `Command not found: <signature>` and exits with an error code 1.

**Pro tip:** If you want to modify these settings, do it as early as possible (before registering any commands/global options) as some settings are used when performing the mentioned tasks.

## capitano.utils

A collection of handy utilities for working with Capitano.

### capitano.utils.getStdin(callback)

Read from stdin. This function is used when you specify a stdin parameter, such as `<|foo>`.

You'll most often use the stdin parameter syntax, but this function is publicly available in case you need more control.

Example:

```coffee
capitano = require('capitano')

capitano.utils.getStdin (data) ->
	console.log("We got #{data} from stdin")
```

Classes
-------

### Command

The Capitano Command class contains the following public fields:

#### Command#signature (Signature)

See the [Signature class](https://github.com/resin-io/capitano#signature).

#### Command#options ([Option])

An array of [Option classes](https://github.com/resin-io/capitano#option).

#### Command#isWildcard()

A predicate method that returns `true` if a command represents a wildcard.

***

### Signature

The Capitano Signature class contains the following public fields:

#### Signature#hasParameters()

A predicate method that returns `true` if the signature has at least one parameter.

#### Signature#hasVariadicParameters()

A predicate method that returns `true` if the signature has at least one variadic parameter.

#### Signature#isWildcard()

A predicate method that returns `true` if the signature represents a wildcard.

#### Signature#allowsStdin()

A predicate method that returns `true` if the signature has at least one stdin parameter.

***

### Option

The Capitano Option class contains the following public fields:

#### Option#signature

See [Signature class](https://github.com/resin-io/capitano#signature).

#### Option#alias (string|[string])

A string or array of string alias.

#### Option#boolean (boolean)

Whether the option is boolean or not.

#### Option#parameter (string)

An option parameter (optional).

#### Option#required (boolean|string)

Defines whether an option is required. If the field is `true`, a generic error is thrown, otherwise you can set a custom error message by setting to a `string`.

Examples
--------

Capitano is very flexible, allowing you to implement all sort of crazy stuff. Here I present some common patterns that I've been doing on Capitano. If you have an interesting idea that you think it's worth to share, please submit a PR!

### Stdin input

```coffee
capitano = require('capitano')

capitano.command
	signature: 'foo <|bar>'
	description: 'a command that accepts stdin input'
	action: (params, options, done) ->
		console.log("The input is: #{params.bar}")
		done()

capitano.run process.argv, (error) ->
	throw error if error?
```

***

```sh
$ echo "Hello World" | stdinApp foo
The input is: Hello World

# Old way still works

$ stdinApp foo "Hello World"
The input is: Hello World
```

### Generated help

Notice this is a very rudimentary help page and lacks features such as printing global options, command specific options, handling correct aligment, etc, but you can at least get an idea on how to implement this for yourself.

```coffee
capitano = require('capitano')

capitano.command
	signature: 'version'
	description: 'output version information'
	action: ...

capitano.command
	signature: 'help'
	description: 'output general help page'
	action: ->
		console.log("Usage: #{myAppName} [COMMANDS] [OPTIONS]")
		console.log('\nCommands:\n')

		for command in capitano.state.commands
			continue if command.isWildcard()
			console.log("\t#{command.signature}\t\t\t"#{command.description})

capitano.run process.argv, (error) ->
	throw error if error?
```

***

```sh
$ app help
Usage: MyCoolApp [COMMANDS] [OPTIONS]

Commands:

	version			output version information
	help			output general help page
```

### Command specific help pages

```coffee
capitano = require('capitano')

capitano.command
	signature: 'version'
	description: 'output version information'
	help: '''
		Software versioning is the process of assigning either unique version names or unique version numbers to unique states of computer software. Within a given version number category (major, minor), these numbers are generally assigned in increasing order and correspond to new developments in the software. At a fine-grained level, revision control is often used for keeping track of incrementally different versions of electronic information, whether or not this information is computer software.
	'''
	action: ...

capitano.command
	signature: 'help [command...]'
	description: 'output general help page'
	action: (params, options, done) ->
		return outputGeneralHelp() if not params?

		capitano.state.getMatchCommand params.command, (error, command) ->
			return done(error) if error?

			if not command? or command.isWildcard()
			return capitano.defaults.actions.commandNotFound(params.command)

			console.log(command.help)
			done()

capitano.run process.argv, (error) ->
	throw error if error?
```

***

```sh
$ app help version
Software versioning is the process of assigning either unique version names or unique version numbers to unique states of computer software. Within a given version number category (major, minor), these numbers are generally assigned in increasing order and correspond to new developments in the software. At a fine-grained level, revision control is often used for keeping track of incrementally different versions of electronic information, whether or not this information is computer software.
```

Tests
-----

Run the test suite by doing:

```sh
$ gulp test
```

Contribute
----------

- Issue Tracker: [github.com/resin-io/capitano/issues](https://github.com/resin-io/capitano/issues)
- Source Code: [github.com/resin-io/capitano](https://github.com/resin-io/capitano)

Before submitting a PR, please make sure that you include tests, and that [coffeelint](http://www.coffeelint.org/) runs without any warning:

```sh
$ gulp lint
```

Support
-------

If you're having any problem, please [raise an issue](https://github.com/resin-io/capitano/issues) on GitHub.

TODO
-------

- Options default values.
- Allow comma-separated parameter values (numbers, floats, etc).

License
-------

The project is licensed under the MIT license.
