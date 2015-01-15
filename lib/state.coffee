_ = require('lodash')
settings = require('./settings')

exports.commands = []
exports.globalOptions = []
exports.permissions = {}

exports.findCommandBySignature = (signature) ->
	return _.findWhere exports.commands, (command) ->
		return command.signature.toString() is signature

exports.getMatchCommand = (signature) ->

	for command in exports.commands

		# Omit wildcard command from the check
		continue if command.isWildcard()

		if command.signature.matches(signature)
			return command

	wildcardSignature = settings.signatures.wildcard
	return exports.findCommandBySignature(wildcardSignature)
