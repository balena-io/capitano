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
utils = require('../lib/utils')

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

	describe '#applyPermissions()', ->

		beforeEach ->
			state.permissions = {}

		describe 'given a command without permissions', ->

			beforeEach ->
				@command = new Command
					signature: new Signature('hello')
					action: _.noop

			it 'should call the callback without errors', ->
				spy = sinon.spy()
				@command.applyPermissions(spy)
				expect(spy).to.have.been.calledOnce
				expect(spy.firstCall.args).to.deep.equal([])

		describe 'given a command with permissions', ->

			beforeEach ->
				@command = new Command
					signature: new Signature('hello')
					action: _.noop
					permission: 'user'

			it 'should continue if permission is found and does not return an error', ->
				state.permissions.user = (done) -> done()
				spy = sinon.spy()
				@command.applyPermissions(spy)
				expect(spy).to.have.been.calledOnce
				expect(spy.firstCall.args).to.deep.equal([])

			it 'should return an error if permission was not found', ->
				spy = sinon.spy()
				@command.applyPermissions(spy)
				expect(spy).to.have.been.calledOnce
				args = spy.firstCall.args
				expect(args[0]).to.be.an.instanceof(Error)
				expect(args[0].message).to.equal('Permission not found: user')

			it 'should return an error if permission is found and returns an error', ->
				state.permissions.user = (done) ->
					error = new Error('You are not a user!')
					done(error)
				spy = sinon.spy()
				@command.applyPermissions(spy)
				expect(spy).to.have.been.calledOnce
				args = spy.firstCall.args
				expect(args[0]).to.be.an.instanceof(Error)
				expect(args[0].message).to.equal('You are not a user!')

	describe '#execute()', ->

		beforeEach ->
			state.globalOptions = []

		it 'should execute the action', (done) ->
			spy = sinon.spy()

			command = new Command
				signature: new Signature('foo <bar>')
				action: spy

			command.execute command: 'foo hello', (error) ->
				expect(error).to.not.exist
				expect(spy).to.have.been.calledOnce
				expect(spy).to.have.been.calledWith(bar: 'hello')
				done()

		it 'should call action within the context of command', (done) ->
			spy = sinon.spy()

			command = new Command
				signature: new Signature('foo')
				action: spy

			command.execute command: 'foo', (error) ->
				expect(error).to.not.exist
				expect(spy).to.have.been.calledOn(command)
				done()

		it 'should pass empty objects if nullary command', (done) ->
			spy = sinon.spy()

			command = new Command
				signature: new Signature('foo')
				action: spy

			command.execute command: 'foo', (error) ->
				expect(error).to.not.exist
				expect(spy).to.have.been.calledWith({}, {})
				done()

		it 'should pass an empty object as the second argument if no options', (done) ->
			spy = sinon.spy()

			command = new Command
				signature: new Signature('foo <bar>')
				action: spy

			expect(state.globalOptions).to.deep.equal([])
			command.execute command: 'foo baz', (error) ->
				expect(error).to.not.exist
				expect(spy).to.have.been.calledWith(bar: 'baz', {})
				done()

		it 'should parse global options', (done) ->
			spy = sinon.spy()

			command = new Command
				signature: new Signature('foo <bar>')
				action: spy

			state.globalOptions.push new Option
				signature: new Signature('quiet')
				boolean: true

			command.execute {
				command: 'foo baz'
				options:
					quiet: true
			}, (error) ->
				expect(error).to.not.exist
				expect(spy).to.have.been.calledWith {
					bar: 'baz'
				}, {
					quiet: true
				}
				done()

		it 'should parse command options', (done) ->
			spy = sinon.spy()

			command = new Command
				signature: new Signature('foo <bar>')
				action: spy
				options: [
					new Option
						signature: new Signature('quiet')
						boolean: true
				]

			command.execute {
				command: 'foo baz'
				options:
					quiet: true
			}, (error) ->
				expect(error).to.not.exist
				expect(spy).to.have.been.calledWith {
					bar: 'baz'
				}, {
					quiet: true
				}
				done()

		it 'should return an error if lacking a required option', (done) ->
			command = new Command
				signature: new Signature('foo <bar>')
				action: _.noop
				options: [
					new Option
						signature: new Signature('quiet')
						boolean: true
						required: 'You have to pass this option'
				]

			command.execute {
				command: 'foo baz'
			}, (error) ->
				expect(error).to.be.an.instanceof(Error)
				expect(error.message).to.equal('You have to pass this option')
				done()

		it 'should parse global and command options', (done) ->
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

			command.execute {
				command: 'foo baz'
				options:
					quiet: true
					c: 'hello.conf'
			}, (error) ->
				expect(error).to.not.exist
				expect(spy).to.have.been.calledWith {
					bar: 'baz'
				}, {
					quiet: true
					config: 'hello.conf'
				}
				done()

		it 'should give precedence to command options', (done) ->
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

			command.execute {
				command: 'foo baz'
				options:
					config: true
			}, (error) ->
				expect(error).to.not.exist
				expect(spy).to.have.been.calledWith {
					bar: 'baz'
				}, {
					config: true
				}
				done()

		it 'should be able to call the done callback manually', (done) ->
			command = new Command
				signature: new Signature('foo <bar>')
				action: (params, options, callback) ->
					return callback(null, 123)

			command.execute command: 'foo bar', (error, data) ->
				expect(error).to.not.exist
				expect(data).to.equal(123)
				done()

		it 'should be able to call the done callback with an error', (done) ->
			cliError = new Error('Test error')

			command = new Command
				signature: new Signature('foo <bar>')
				action: (params, options, callback) ->
					return callback(cliError)

			command.execute command: 'foo bar', (error) ->
				expect(error).to.deep.equal(cliError)
				done()

		it 'should call the action if no callback', (done) ->
			spy = sinon.spy()

			command = new Command
				signature: new Signature('foo <bar>')
				action: spy

			command.execute command: 'foo bar', (error) ->
				expect(error).to.not.exist
				expect(spy).to.have.been.calledOnce
				done()

		describe 'given a synchronous action that throws an error', ->

			beforeEach ->
				@command = new Command
					signature: new Signature('hello')
					action: ->
						throw new Error('Command Error')

			it 'should catch the error and send it to the callback', (done) ->
				@command.execute command: 'hello', (error) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Command Error')
					done()

		describe 'given an asynchronous action that throws an error', ->

			command = new Command
				signature: new Signature('hello')
				action: (params, parsedOptions, callback) ->
					Promise.reject new Error 'Command Error (rejected promise)'

			it 'should catch the error and send it to the callback', (done) ->
				command.execute command: 'hello', (error) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Command Error (rejected promise)')
					done()

		describe 'given an asynchronous action that does not declare a callback', ->

			command = new Command
				signature: new Signature('hello')
				action: (params, parsedOptions) ->
					Promise.resolve 42

			it 'should call the callback without arguments', (done) ->
				command.execute command: 'hello', (value) ->
					expect(value).not.to.exist
					done()

		describe 'given a command with the root property', ->

			beforeEach ->
				@actionSpy = sinon.spy()
				@command = new Command
					signature: new Signature('foo')
					action: @actionSpy
					root: true

			describe 'given the user is root', ->

				beforeEach ->
					@utilsIsElevatedStub = sinon.stub(utils, 'isElevated')
					@utilsIsElevatedStub.yields(null, true)

				afterEach ->
					@utilsIsElevatedStub.restore()

				it 'should execute the action normally', (done) ->
					@command.execute command: 'foo', (error) =>
						expect(error).to.not.exist
						expect(@actionSpy).to.have.been.called
						done()

			describe 'given the user is not root', ->

				beforeEach ->
					@utilsIsElevatedStub = sinon.stub(utils, 'isElevated')
					@utilsIsElevatedStub.yields(null, false)

				afterEach ->
					@utilsIsElevatedStub.restore()

				it 'should not execute the action', (done) ->
					@command.execute command: 'foo', =>
						expect(@actionSpy).to.not.have.been.called
						done()

				it 'should return an error', (done) ->
					@command.execute command: 'foo', (error) ->
						expect(error).to.be.an.instanceof(Error)
						expect(error.message).to.equal('You need admin privileges to run this command')
						expect(error.code).to.equal('EACCES')
						done()

		describe 'given a command with permissions', ->

			beforeEach ->
				state.permissions = {}

				@actionSpy = sinon.spy()
				@command = new Command
					signature: new Signature('foo')
					action: @actionSpy
					permission: 'user'

			it 'should call the action if permission is found and does not return an error', (done) ->
				state.permissions.user = (done) -> done()
				@command.execute command: 'foo', (error) =>
					expect(error).to.not.exist
					expect(@actionSpy).to.have.been.called
					done()

			it 'should not call the action if permission is found and returns an error', (done) ->
				state.permissions.user = (done) ->
					error = new Error('You are not a user!')
					done(error)

				@command.execute command: 'foo', (error) =>
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('You are not a user!')
					expect(@actionSpy).to.not.have.been.called
					done()

			it 'should return an error if permission is not found', (done) ->
				@command.execute command: 'foo', (error) =>
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Permission not found: user')
					expect(@actionSpy).to.not.have.been.called
					done()

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
