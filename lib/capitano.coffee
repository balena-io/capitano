_ = require('lodash')
Command = require('./command')
Option = require('./option')
Signature = require('./signature')

exports.parse = require('./parse').parse
exports.state = require('./state')
exports.defaults = require('./settings')
exports.utils = require('./utils')

exports.command = (options) ->
	options.options = _.map options.options, (option) ->

		# Necessary to prevent modifying the signature
		# of the original object, and causing issues
		# if the same object is used in another command
		result = _.clone(option)

		result.signature = new Signature(option.signature)
		return new Option(result)

	options.signature = new Signature(options.signature)
	command = new Command(options)
	exports.state.commands.push(command)

exports.globalOption = (options) ->
	options.signature = new Signature(options.signature)
	option = new Option(options)
	exports.state.globalOptions.push(option)

exports.permission = (name, permissionFunction) ->
	if not name?
		throw new Error('Missing permission name')

	if not _.isString(name)
		throw new Error('Invalid permission name')

	if not permissionFunction?
		throw new Error('Missing permission function')

	if not _.isFunction(permissionFunction)
		throw new Error('Invalid permission function')

	exports.state.permissions[name] = permissionFunction

exports.execute = (args, callback) ->
	exports.state.getMatchCommand args.command, (error, command) ->
		return callback?(error) if error?

		if not command?
			return exports.defaults.actions.commandNotFound(args.command)

		try
			command.execute(args, callback)
		catch error
			return callback?(error)

# Handy shortcut
exports.run = (argv, callback) ->
	parsedArgs = exports.parse(argv)
	exports.execute(parsedArgs, callback)
