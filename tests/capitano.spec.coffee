_ = require('lodash')
sinon = require('sinon')
chai = require('chai')
chai.use(require('sinon-chai'))
expect = chai.expect
cliManager = require('../lib/capitano')
utils = require('../lib/utils')

describe 'Capitano:', ->

	beforeEach ->
		cliManager.state.commands = []
		cliManager.state.globalOptions = []
		cliManager.state.permissions = {}

	describe '#permission()', ->

		it 'should throw an error if no name', ->
			expect ->
				cliManager.permission()
			.to.throw('Missing permission name')

		it 'should throw an error if name is not a string', ->
			expect ->
				cliManager.permission([ 'permissions' ])
			.to.throw('Invalid permission name')

		it 'should throw an error if no function', ->
			expect ->
				cliManager.permission('hello')
			.to.throw('Missing permission function')

		it 'should throw an error if function is not a function', ->
			expect ->
				cliManager.permission('name', [ 'function' ])
			.to.throw('Invalid permission function')

		it 'should add a permissions', ->
			expect(cliManager.state.permissions.user).to.not.exist
			cliManager.permission('user', _.noop)
			expect(cliManager.state.permissions.user).to.exist
			expect(cliManager.state.permissions.user).to.equal(_.noop)

	describe '#command()', ->

		it 'should add a command', ->
			expect(cliManager.state.commands).to.have.length(0)

			cliManager.command
				signature: 'hello <name>'
				action: _.noop

			expect(cliManager.state.commands).to.have.length(1)
			command = cliManager.state.commands[0]
			expect(command.signature.toString()).to.equal('hello <name>')

		it 'should add a command with options', ->
			expect ->
				cliManager.command
					signature: 'hello <name>'
					action: _.noop
					options: [
						{
							signature: 'quiet'
							boolean: true
						}
						{
							signature: 'yes'
							boolean: true
						}
					]
			.to.not.throw(Error)

			commandOptions = cliManager.state.commands[0].options
			expect(commandOptions[0].signature.toString()).to.equal('quiet')
			expect(commandOptions[1].signature.toString()).to.equal('yes')

		# Caused by command() modifying the original object
		it 'should allow using the same option object multiple times', ->
			yesOption =
				signature: 'yes'
				boolean: true

			cliManager.command
				signature: 'foo <bar>'
				action: _.noop
				options: [ yesOption ]

			expect ->
				cliManager.command
					signature: 'hello <name>'
					action: _.noop
					options: [ yesOption ]
			.to.not.throw(Error)

	describe '#option()', ->

		it 'should add an option', ->
			expect(cliManager.state.globalOptions).to.have.length(0)

			cliManager.globalOption
				signature: 'quiet'
				boolean: true

			expect(cliManager.state.globalOptions).to.have.length(1)
			option = cliManager.state.globalOptions[0]
			expect(option.signature.toString()).to.equal('quiet')

	describe '#execute()', ->

		it 'should execute a command', (done) ->
			spy = sinon.spy()

			cliManager.command
				signature: 'hello <name>'
				action: spy

			cliManager.execute command: 'hello John', (error) ->
				expect(error).to.not.exist
				expect(spy).to.have.been.calledOnce
				expect(spy).to.have.been.calledWith(name: 'John')
				done()

		it 'should call commandNotFound if command not found', ->
			commandNotFoundStub = sinon.stub(cliManager.defaults.actions, 'commandNotFound')
			cliManager.execute(command: 'not valid command')
			expect(commandNotFoundStub).to.have.been.called
			expect(commandNotFoundStub).to.have.been.calledWith('not valid command')
			commandNotFoundStub.restore()

		it 'should return an error if there was an error executing the command', (done) ->
			commandNotFoundStub = sinon.stub(cliManager.defaults.actions, 'commandNotFound')

			cliManager.command
				signature: 'hello <name>'
				action: _.noop

			cliManager.execute command: 'hello', (error) ->
				expect(error).to.be.an.instanceof(Error)
				expect(error.message).to.equal('Missing name')
				commandNotFoundStub.restore()
				done()

		it 'should pass an execution error to the default handler', (done) ->
			actionError = new Error('action error')

			cliManager.command
				signature: 'hello'
				action: (params, options, callback) ->
					return callback(actionError)

			cliManager.execute command: 'hello', (error) ->
				expect(error).to.deep.equal(actionError)
				done()

		it 'should pass an async execution error to the default handler', (done) ->
			actionError = new Error('action error')

			cliManager.command
				signature: 'hello'
				action: (params, options, callback) ->
					setTimeout ->
						return callback(actionError)
					, 1

			cliManager.execute command: 'hello', (error) ->
				expect(error).to.deep.equal(actionError)
				done()

		it 'should not throw an error if missing callback', ->
			cliManager.command
				signature: 'hello'
				action: (params, options, callback) ->
					return callback(actionError)

			expect ->
				cliManager.execute(command: 'hello')
			.to.not.throw(Error)

		describe 'given a stdin command', ->

			describe 'if parameter was passed', ->

				it 'should execute correctly', (done) ->
					spy = sinon.spy()

					cliManager.command
						signature: 'hello <|name>'
						action: spy

					cliManager.execute command: 'hello John', (error) ->
						expect(error).to.not.exist
						expect(spy).to.have.been.calledOnce
						expect(spy).to.have.been.calledWith(name: 'John')
						done()

			describe 'if stdin was passed', ->

				beforeEach ->
					@utilsGetStdinStub = sinon.stub(utils, 'getStdin')
					@utilsGetStdinStub.callsArgWithAsync(0, 'Jane')

				afterEach ->
					@utilsGetStdinStub.restore()

				it 'should execute correctly', (done) ->
					spy = sinon.spy()

					cliManager.command
						signature: 'hello <|name>'
						action: spy

					cliManager.execute command: 'hello', (error) ->
						expect(error).to.not.exist
						expect(spy).to.have.been.calledOnce
						expect(spy).to.have.been.calledWith(name: 'Jane')
						done()

	describe '#run()', ->

		it 'should parse and execute a command', (done) ->
			spy = sinon.spy()

			cliManager.command
				signature: 'hello <name>'
				action: spy

			cliManager.run 'hello John', (error) ->
				expect(error).to.not.exist
				expect(spy).to.have.been.calledOnce
				expect(spy).to.have.been.calledWith(name: 'John')
				done()

		it 'should pass an option value starting with a number correctly', (done) ->
			spy = sinon.spy()

			cliManager.command
				signature: 'hello'
				action: spy
				options: [
					signature: 'application'
					parameter: 'application'
				]

			cliManager.run 'hello --application 10Jun2014', (error) ->
				expect(error).to.not.exist
				expect(spy).to.have.been.calledOnce
				expect(spy).to.have.been.calledWith({}, application: '10Jun2014')
				done()

		it 'should pass any error to the callback', (done) ->
			cliManager.command
				signature: 'hello <name>'
				action: (params, options, callback) ->
					return callback(new Error())

			cliManager.run 'hello', (error) ->
				expect(error).to.be.an.instanceof(Error)
				expect(error.message).to.equal('Missing name')
				done()
