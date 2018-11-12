_ = require('lodash')
parse = require('./parse')
settings = require('./settings')
state = require('./state')
Option = require('./option')
Signature = require('./signature')
utils = require('./utils')

module.exports = class Command
	constructor: (options = {}) ->

		if options.signature not instanceof Signature
			throw new Error('Missing or invalid command signature')

		if not _.isFunction(options.action)
			throw new Error('Missing or invalid command action')

		if options.options? and not _.isArray(options.options)
			throw new Error('Invalid options')

		@options = []

		_.forEach options.options, (option) =>
			@option(option)

		_.extend(this, _.omit(options, 'options'))

	applyPermissions: (callback) ->
		return callback() if not @permission?

		permissionFunction = state.permissions[@permission]

		if not permissionFunction?
			error = new Error("Permission not found: #{@permission}")
			return callback(error)

		permissionFunction.call(this, callback)

	# TODO: Tested implicitly by execute() tests, but it might
	# worth to test this explicitly to find other corner cases
	_parseOptions: (options) ->
		allOptions = _.union(state.globalOptions, @options)
		parsedOptions = parse.parseOptions(allOptions, options)

	_checkElevation: (callback) ->
		if @root?
			utils.isElevated(callback)
		else
			return callback(null, true)

	execute: (args = {}, callback) ->

		@signature.compileParameters args.command, (error, params) =>
			return callback?(error) if error?

			@_checkElevation (error, isElevated) =>
				return callback?(error) if error?

				if @root and not isElevated
					error = new Error('You need admin privileges to run this command')
					error.code = 'EACCES'
					return callback(error)

				try
					parsedOptions = @_parseOptions(args.options)
				catch error
					return callback?(error)

				@applyPermissions (error) =>
					return callback?(error) if error?

					try
						actionPromise = @action(params, parsedOptions, callback)
					catch error
						return callback?(error)

					if callback?
						if actionPromise?.then?
							# Asynchronous action function
							actionPromise.then(
								# the value of a fulfilled promise is intentionally ignored because users are expected
								# to call the callback themselves, and also for backwards compatibility.
								# action.length < 3 means the `callback` argument is not declared in the action method.
								(_value) => callback() if @action.length < 3

								# call the callback if the promise is rejected (e.g. if an async action function throws
								# an error), whether or not the user declared a callback as an argument to the action
								# method. This is consistent with the existing implementation for synchronous action
								# functions that throw an error.
								callback)
						else
							# else: synchronous action function
							# action.length < 3 means the `callback` argument is not declared in the action method.
							callback() if @action.length < 3

	option: (option) ->
		if option not instanceof Option
			throw new Error('Invalid option')

		return if _.find(@options, option)?
		@options.push(option)

	isWildcard: ->
		return @signature.isWildcard()
