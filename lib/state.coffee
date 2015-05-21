_ = require('lodash')
async = require('async')
settings = require('./settings')

exports.commands = []
exports.globalOptions = []
exports.permissions = {}

exports.findCommandBySignature = (signature) ->
	return _.find exports.commands, (command) ->
		return command.signature.toString() is signature

exports.getMatchCommand = (signature, callback) ->

	# Omit wildcard command from the check
	commands = _.reject exports.commands, (command) ->
		return command.isWildcard()

	async.eachSeries commands, (command, done) ->
		command.signature.matches signature, (result) ->
			return done() if not result

			# TODO: Breaking from the async look this way may
			# cause a memory leak.
			# One possible solution is to call done() with the result
			# tricking async that is an error, and handle accordingly
			# in the final callback. However the solution looks ugly.
			# Search for alternatives
			return callback(null, command)
	, (error) ->
		return callback(error) if error?

		wildcardSignature = settings.signatures.wildcard
		result = exports.findCommandBySignature(wildcardSignature)
		return callback(null, result)
