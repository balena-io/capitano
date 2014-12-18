_ = require('lodash')
sinon = require('sinon')
chai = require('chai')
chai.use(require('sinon-chai'))
expect = chai.expect
Command = require('../lib/command')
Option = require('../lib/option')
Signature = require('../lib/signature')
settings = require('../lib/settings')
state = require('../lib/state')

describe 'Command:', ->

	describe '#constructor()', ->

		describe 'signature option', ->

			it 'should throw an error if no signature', ->
				expect ->
					new Command(action: _.noop)
				.to.throw(Error)

			it 'should throw an error if signature is not a string', ->
				expect ->
					new Command
						signature: new Signature([ 1, 2, 3 ])
				.to.throw(Error)

		describe 'action option', ->

			it 'should throw an error if no action', ->
				expect ->
					new Command
						signature: new Signature('foo')
				.to.throw(Error)

			it 'should throw an error if action is not a function', ->
				expect ->
					new Command
						signature: new Signature('foo')
						action: 'bar'
				.to.throw(Error)

		describe 'options option', ->

			it 'should throw an error if not array', ->
				expect ->
					new Command
						signature: new Signature('hello')
						action: _.noop
						options: { hello: boolean: true }
				.to.throw(Error)

			it 'should default to an empty array', ->
				command = new Command
					signature: new Signature('hello')
					action: _.noop

				expect(command.options).to.deep.equal([])

			it 'should parse each option', ->
				command = new Command
					signature: new Signature('hello')
					action: _.noop
					options: [
						new Option
							signature: new Signature('quiet')
							boolean: true
						new Option
							signature: new Signature('config')
							parameter: 'name'
					]

				expect(command.options).to.be.an.instanceof(Array)
				for option in command.options
					expect(option).to.be.an.instanceof(Option)

	describe '#option()', ->

		it 'should throw an error if option is not an instance of Option', ->
			command = new Command
				signature: new Signature('hello')
				action: _.noop

			expect ->
				command.option({ option: 'world' })
			.to.throw(Error)

		it 'should add an option', ->
			command = new Command
				signature: new Signature('hello')
				action: _.noop

			expect(command.options).to.have.length(0)
			command.option new Option
				signature: new Signature('quiet')
				boolean: true
			expect(command.options).to.have.length(1)
			expect(command.options[0].signature.toString()).to.equal('quiet')

		it 'should not add duplicated options', ->
			command = new Command
				signature: new Signature('hello')
				action: _.noop

			option = new Option
				signature: new Signature('quiet')
				boolean: true

			expect(command.options).to.have.length(0)
			command.option(option)
			expect(command.options).to.have.length(1)
			command.option(option)
			expect(command.options).to.have.length(1)

	describe '#execute()', ->

		beforeEach ->
			state.globalOptions = []

		it 'should execute the action', ->
			spy = sinon.spy()

			command = new Command
				signature: new Signature('foo <bar>')
				action: spy

			command.execute(command: 'foo hello')
			expect(spy).to.have.been.calledOnce
			expect(spy).to.have.been.calledWith(bar: 'hello')

		it 'should call action within the context of command', ->
			spy = sinon.spy()

			command = new Command
				signature: new Signature('foo')
				action: spy

			command.execute(command: 'foo')
			expect(spy).to.have.been.calledOn(command)

		it 'should pass empty objects if nullary command', ->
			spy = sinon.spy()

			command = new Command
				signature: new Signature('foo')
				action: spy

			command.execute(command: 'foo')
			expect(spy).to.have.been.calledWith({}, {})

		it 'should pass an empty object as the second argument if no options', ->
			spy = sinon.spy()

			command = new Command
				signature: new Signature('foo <bar>')
				action: spy

			expect(state.globalOptions).to.deep.equal([])
			command.execute(command: 'foo baz')
			expect(spy).to.have.been.calledWith(bar: 'baz', {})

		it 'should parse global options', ->
			spy = sinon.spy()

			command = new Command
				signature: new Signature('foo <bar>')
				action: spy

			state.globalOptions.push new Option
				signature: new Signature('quiet')
				boolean: true

			command.execute
				command: 'foo baz'
				options:
					quiet: true

			expect(spy).to.have.been.calledWith {
				bar: 'baz'
			}, {
				quiet: true
			}

		it 'should parse command options', ->
			spy = sinon.spy()

			command = new Command
				signature: new Signature('foo <bar>')
				action: spy
				options: [
					new Option
						signature: new Signature('quiet')
						boolean: true
				]

			command.execute
				command: 'foo baz'
				options:
					quiet: true

			expect(spy).to.have.been.calledWith {
				bar: 'baz'
			}, {
				quiet: true
			}

		it 'should parse global and command options', ->
			spy = sinon.spy()

			state.globalOptions.push new Option
				signature: new Signature('config')
				parameter: 'name'
				boolean: false
				alias: 'c'

			command = new Command
				signature: new Signature('foo <bar>')
				action: spy
				options: [
					new Option
						signature: new Signature('quiet')
						boolean: true
				]

			command.execute
				command: 'foo baz'
				options:
					quiet: true
					c: 'hello.conf'

			expect(spy).to.have.been.calledWith {
				bar: 'baz'
			}, {
				quiet: true
				config: 'hello.conf'
			}

		it 'should give precedence to command options', ->
			spy = sinon.spy()

			state.globalOptions.push new Option
				signature: new Signature('config')
				parameter: 'name'

			command = new Command
				signature: new Signature('foo <bar>')
				action: spy
				options: [
					new Option
						signature: new Signature('config')
						boolean: true
				]

			command.execute
				command: 'foo baz'
				options:
					config: true

			expect(spy).to.have.been.calledWith {
				bar: 'baz'
			}, {
				config: true
			}

	describe '#isWildcard()', ->

		it 'should return true if is wildcard', ->
			command = new Command
				signature: new Signature(settings.signatures.wildcard)
				action: _.noop

			expect(command.isWildcard()).to.be.true

		it 'should return false if not wildcard', ->
			command = new Command
				signature: new Signature('foo bar')
				action: _.noop

			expect(command.isWildcard()).to.be.false
