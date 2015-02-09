_ = require('lodash')
async = require('async')
settings = require('./settings')

exports.commands = []
exports.globalOptions = []
exports.permissions = {}

exports.findCommandBySignature = (signature) ->
	return _.findWhere exports.commands, (command) ->
		return command.signature.toString() is signature

exports.getMatchCommand = (signature, callback) ->

	# Omit wildcard command from the check
	commands = _.reject exports.commands, (command) ->
		return command.isWildcard()

	async.eachSeries commands, (command, done) ->
		command.signature.matches signature, (result) ->
			return done() if not result
			return callback(null, command)
	, (error) ->
		return callback(error) if error?

		wildcardSignature = settings.signatures.wildcard
		result = exports.findCommandBySignature(wildcardSignature)
		return callback(null, result)
