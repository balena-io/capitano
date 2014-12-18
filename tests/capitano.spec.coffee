_ = require('lodash')
sinon = require('sinon')
chai = require('chai')
expect = chai.expect
cliManager = require('../lib/capitano')

describe 'Capitano:', ->

	beforeEach ->
		cliManager.state.commands = []
		cliManager.state.globalOptions = []

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

		it 'should execute a command', ->
			spy = sinon.spy()

			cliManager.command
				signature: 'hello <name>'
				action: spy

			cliManager.execute(command: 'hello John')

			expect(spy).to.have.been.calledOnce
			expect(spy).to.have.been.calledWith(name: 'John')

		it 'should call commandNotFound if command not found', ->
			commandNotFoundStub = sinon.stub(cliManager.defaults.actions, 'commandNotFound')
			cliManager.execute(command: 'not valid command')
			expect(commandNotFoundStub).to.have.been.called
			expect(commandNotFoundStub).to.have.been.calledWith('not valid command')
			commandNotFoundStub.restore()

		it 'should all onError if there was an error executing the command', ->
			onErrorStub = sinon.stub(cliManager.defaults.actions, 'onError')
			commandNotFoundStub = sinon.stub(cliManager.defaults.actions, 'commandNotFound')

			cliManager.command
				signature: 'hello <name>'
				action: _.noop

			cliManager.execute(command: 'hello')

			expect(commandNotFoundStub).to.not.have.been.called
			expect(onErrorStub).to.have.been.called
			args = onErrorStub.firstCall.args
			expect(args).to.have.length(1)
			expect(args[0]).to.be.an.instanceof(Error)
			expect(args[0].message).to.equal('Missing name')

			onErrorStub.restore()
			commandNotFoundStub.restore()

	describe '#run()', ->

		it 'should parse and execute a command', ->
			spy = sinon.spy()

			cliManager.command
				signature: 'hello <name>'
				action: spy

			cliManager.run('hello John')
			expect(spy).to.have.been.calledOnce
			expect(spy).to.have.been.calledWith(name: 'John')
