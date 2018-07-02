_ = require('lodash')
_.str = require('underscore.string')
chai = require('chai')
expect = chai.expect
parse = require('../lib/parse')
state = require('../lib/state')
Option = require('../lib/option')
Signature = require('../lib/signature')
settings = require('../lib/settings')

describe 'Parse:', ->

	describe '#normalizeInput()', ->

		it 'should handle strings', ->
			result = parse.normalizeInput('-x 3 -y 4')
			expect(result).to.deep.equal([ '-x', '3', '-y', '4' ])

		it 'should handle arrays', ->
			result = parse.normalizeInput([ '-x', '3', '-y', '4' ])
			expect(result).to.deep.equal([ '-x', '3', '-y', '4' ])

		it 'should discard first arguments if process.argv', ->
			result = parse.normalizeInput(process.argv)
			expect(result).to.deep.equal(process.argv.slice(2))

		it 'should throw an error if invalid input', ->
			expect ->
				parse.normalizeInput({ hello: 'world' })
			.to.throw(Error)

	describe '#parse()', ->

		describe 'options', ->

			beforeEach ->
				state.globalOptions = []

			it 'should be able to parse options', ->
				argv = parse.split('-x 3 -y 4')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					global: {}
					options:
						x: 3
						y: 4

			it 'should be able to parse boolean options', ->
				argv = parse.split('-x --foo')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					global: {}
					options:
						x: true
						foo: true

			it 'should be able to compile global options', ->
				state.globalOptions.push new Option
					signature: new Signature('quiet')
					boolean: true

				argv = parse.split('foo --quiet')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					global:
						quiet: true
					options:
						quiet: true
					command: 'foo'

			it 'should be able to compile global options with aliases', ->
				state.globalOptions.push new Option
					signature: new Signature('quiet')
					boolean: true
					alias: 'q'

				argv = parse.split('foo -q')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					global:
						quiet: true
					options:
						q: true
					command: 'foo'

		describe 'commands', ->

			it 'should be able to parse commands', ->
				argv = parse.split('auth login')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'auth login'
					options: {}
					global: {}

			it 'should be able to parse commands with suffix options', ->
				argv = parse.split('auth login -f -n 10')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'auth login'
					global: {}
					options:
						f: true
						n: 10

			it 'should be able to parse commands with prefix options', ->
				argv = parse.split('-f -n 10 auth login')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'auth login'
					global: {}
					options:
						f: true
						n: 10

			it 'should be able to parse commands with infix options', ->
				argv = parse.split('auth -f -n 10 login')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'auth login'
					global: {}
					options:
						f: true
						n: 10

			it 'should be able to parse commands with arguments', ->
				argv = parse.split('auth login <credentials>')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'auth login <credentials>'
					global: {}
					options: {}

			it 'should be able to parse commands with multiple arguments', ->
				argv = parse.split('auth login <credentials> <foo>')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'auth login <credentials> <foo>'
					global: {}
					options: {}

			it 'should be able to parse commands with optional arguments', ->
				argv = parse.split('auth login [foo]')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'auth login [foo]'
					global: {}
					options: {}

			it 'should be able to parse commands with multiple arguments', ->
				argv = parse.split('transfer <from name> <to name>')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'transfer <from name> <to name>'
					global: {}
					options: {}

			it 'should be able to parse commands with optional arguments', ->
				argv = parse.split('greet [their name]')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'greet [their name]'
					global: {}
					options: {}

			it 'should not discard single quotes when parsing the command', ->
				argv = parse.split('hello \'John Doe\'')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'hello "John Doe"'
					global: {}
					options: {}

			it 'should not discard double quotes when parsing the command', ->
				argv = parse.split('hello "John Doe"')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'hello "John Doe"'
					global: {}
					options: {}

			it 'should not parse numbers in scientific notation automatically', ->
				argv = parse.split('hello -x 43e8273')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'hello'
					global: {}
					options:
						x: '43e8273'

			it 'should parse float numbers automatically', ->
				argv = parse.split('hello -x 1.5 -y .9')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'hello'
					global: {}
					options:
						x: 1.5
						y: 0.9

			it 'should not parse \'.\' as float number', ->
				argv = parse.split('hello -x .')
				result = parse.parse(argv)
				expect(result).to.deep.equal
					command: 'hello'
					global: {}
					options:
						x: '.'

	describe '#split()', ->

		it 'should return an empty array if no signature', ->
			signature = undefined
			result = []
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split a wildcard signature correctly', ->
			signature = settings.signatures.wildcard
			result = [ settings.signatures.wildcard ]
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split signatures correctly', ->
			signature = 'foo <bar>'
			result = [ 'foo', '<bar>' ]
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split multi word required parameters', ->
			signature = '<hello world> <foo bar baz>'
			result = [ '<hello world>', '<foo bar baz>' ]
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split multi word optional parameters', ->
			signature = '[hello world] [foo bar baz]'
			result = [ '[hello world]', '[foo bar baz]' ]
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split multi word variadic required parameters', ->
			signature = '<hello world...> <foo bar baz...>'
			result = [ '<hello world...>', '<foo bar baz...>' ]
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split multi word optional parameters', ->
			signature = '[hello world...] [foo bar baz...]'
			result = [ '[hello world...]', '[foo bar baz...]' ]
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split absolute paths parameters correctly', ->
			signature = 'foo /Users/me/foo/bar'
			result = [ 'foo', '/Users/me/foo/bar' ]
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split absolute paths (win32) parameters correctly', ->
			signature = 'foo C:\\Users\\me\\foo\\bar'
			result = [ 'foo', 'C:\\Users\\me\\foo\\bar' ]
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split relative paths parameters correctly', ->
			signature = 'foo ../hello/world'
			result = [ 'foo', '../hello/world' ]
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split home relative paths parameters correctly', ->
			signature = 'foo ~/.ssh/id_rsa.pub'
			result = [ 'foo', '~/.ssh/id_rsa.pub' ]
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split words surrounded by quotes correctly', ->
			signature = 'foo \'hello world\''
			result = [ 'foo', 'hello world' ]
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split words surrounded by double quotes correctly', ->
			signature = 'foo "hello world"'
			result = [ 'foo', 'hello world' ]
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split words with escaped double quotes and surrounded by double quotes correctly', ->
			signature = 'foo "hello \\\"world\\\""'
			result = [ 'foo', 'hello \\"world\\"' ]
			expect(parse.split(signature)).to.deep.equal(result)

		it 'should split words with escaped single quotes and surrounded by single quotes correctly', ->
			signature = 'foo \'hello \\\'world\\\'\''
			result = [ 'foo', 'hello \\\'world\\\'' ]
			expect(parse.split(signature)).to.deep.equal(result)

	describe '#parseOptions()', ->

		it 'should not throw if options is undefined', ->
			definedOptions = []
			definedOptions.push new Option
				signature: new Signature('foo')
				boolean: true

			expect ->
				parse.parseOptions(definedOptions, undefined)
			.to.not.throw(Error)

		it 'should return an empty object if defined options is empty', ->
			options =
				hello: 'world'
				quiet: true
			expect(parse.parseOptions([], options)).to.deep.equal({})

		it 'should return an empty object if options is empty', ->
			definedOptions = []
			definedOptions.push new Option
				signature: new Signature('foo')
				parameter: 'bar'
			expect(parse.parseOptions(definedOptions, [])).to.deep.equal({})

		it 'should parse simple options (without aliases)', ->
			definedOptions = []
			definedOptions.push new Option
				signature: new Signature('foo')
				parameter: 'bar'

			definedOptions.push new Option
				signature: new Signature('quiet')
				boolean: true

			options =
				foo: 'baz'
				quiet: true

			result = parse.parseOptions(definedOptions, options)
			expect(result).to.deep.equal
				foo: 'baz'
				quiet: true

		it 'should parse options starting with a number correctly', ->
			definedOptions = []
			definedOptions.push new Option
				signature: new Signature('foo')
				parameter: 'bar'

			options =
				foo: '10foobar'

			result = parse.parseOptions(definedOptions, options)
			expect(result).to.deep.equal
				foo: '10foobar'

		it 'should parse options containing integers as numbers', ->
			definedOptions = []
			definedOptions.push new Option
				signature: new Signature('foo')
				parameter: 'bar'

			options =
				foo: '10'

			result = parse.parseOptions(definedOptions, options)
			expect(result).to.deep.equal
				foo: 10

		it 'should discard non matched options', ->
			definedOptions = []
			definedOptions.push new Option
				signature: new Signature('foo')
				parameter: 'bar'

			definedOptions.push new Option
				signature: new Signature('hello')
				parameter: 'world'

			definedOptions.push new Option
				signature: new Signature('quiet')
				boolean: true

			options =
				foo: 'baz'
				quiet: 'hello'
				hello: true

			result = parse.parseOptions(definedOptions, options)
			expect(result).to.deep.equal
				foo: 'baz'

		it 'shoud omit extra defined options', ->
			definedOptions = []
			definedOptions.push new Option
				signature: new Signature('foo')
				parameter: 'bar'

			definedOptions.push new Option
				signature: new Signature('quiet')
				boolean: true

			options =
				foo: 'baz'

			result = parse.parseOptions(definedOptions, options)
			expect(result).to.deep.equal
				foo: 'baz'

		it 'should handle string aliases', ->
			definedOptions = []
			definedOptions.push new Option
				signature: new Signature('foo')
				parameter: 'bar'
				alias: 'f'

			options =
				f: 'baz'

			result = parse.parseOptions(definedOptions, options)
			expect(result).to.deep.equal
				foo: 'baz'

		it 'should handle array aliases', ->
			definedOptions = []
			definedOptions.push new Option
				signature: new Signature('foo')
				parameter: 'bar'
				alias: [ 'a', 'b', 'c' ]

			options =
				b: 'baz'

			result = parse.parseOptions(definedOptions, options)
			expect(result).to.deep.equal
				foo: 'baz'

		it 'should handle multiletter aliases', ->
			definedOptions = []
			definedOptions.push new Option
				signature: new Signature('foo')
				parameter: 'bar'
				alias: 'hello'

			options =
				hello: 'world'

			result = parse.parseOptions(definedOptions, options)
			expect(result).to.deep.equal
				foo: 'world'

		it 'should give precedence to long names', ->
			definedOptions = []
			definedOptions.push new Option
				signature: new Signature('foo')
				parameter: 'bar'
				alias: [ 'a', 'b', 'c' ]

			options =
				foo: 'bar'
				b: 'baz'

			result = parse.parseOptions(definedOptions, options)
			expect(result).to.deep.equal
				foo: 'bar'

		it 'should parse numbers automatically', ->
			definedOptions = []
			definedOptions.push new Option
				signature: new Signature('foo')
				parameter: 'bar'

			options =
				foo: '25'

			result = parse.parseOptions(definedOptions, options)
			expect(result).to.deep.equal
				foo: 25

		describe 'given an option required key', ->

			it 'should throw a generic error if true', ->
				definedOptions = []
				definedOptions.push new Option
					signature: new Signature('foo')
					parameter: 'bar'
					required: true

				options =
					hello: 'world'

				expect ->
					parse.parseOptions(definedOptions, options)
				.to.throw('Option foo is required')

			it 'should not throw if false', ->
				definedOptions = []
				definedOptions.push new Option
					signature: new Signature('foo')
					parameter: 'bar'
					required: false

				options =
					hello: 'world'

				expect ->
					parse.parseOptions(definedOptions, options)
				.to.not.throw('Option foo is required')

			it 'should throw a custom error if required is a string', ->
				definedOptions = []
				definedOptions.push new Option
					signature: new Signature('foo')
					parameter: 'bar'
					required: 'Custom error!'

				options =
					hello: 'world'

				expect ->
					parse.parseOptions(definedOptions, options)
				.to.throw('Custom error!')
