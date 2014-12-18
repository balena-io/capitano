_ = require('lodash')
_.str = require('underscore.string')
Parameter = require('./parameter')
settings = require('./settings')
parse = require('./parse')

module.exports = class Signature
	constructor: (signature) ->

		if not signature? or not _.isString(signature)
			throw new Error('Missing or invalid signature')

		@parameters = []

		_.each(parse.split(signature), @_addParameter, this)

		if @hasVariadicParameters()
			variadicParameters = _.filter @parameters, (parameter) ->
				return parameter.isVariadic()

			if variadicParameters.length > 1
				throw new Error('Signature can only contain one variadic parameter')

			index = _.findIndex @parameters, (parameter) ->
				return parameter.isVariadic()

			if index isnt @parameters.length - 1
				throw new Error('The variadic parameter should be the last')

	_addParameter: (word) ->
		parameter = new Parameter(word)
		@parameters.push(parameter)

	hasParameters: ->
		return _.any @parameters, (parameter) ->
			return not parameter.isWord()

	hasVariadicParameters: ->
		return _.any @parameters, (parameter) ->
			return parameter.isVariadic()

	toString: ->
		result = []
		for parameter in @parameters
			result.push(parameter.toString())
		return result.join(' ')

	isWildcard: ->
		return _.all [
			@parameters.length is 1
			@parameters[0].toString() is settings.signatures.wildcard
		]

	# TODO: There should be a better way to implement
	# this algorithm without duplicating a big chunk of
	# compileParameters().
	# Maybe there should be a third function that these
	# two algorithms share?
	matches: (command) ->
		try
			@compileParameters(command)
			return true
		catch error
			if _.str.startsWith(error.message, 'Missing')
				return true
			return false

	compileParameters: (command) ->
		commandWords = parse.split(command)
		comparison = _.zip(@parameters, commandWords)

		result = {}

		return result if @isWildcard()

		for item in comparison
			parameter = item[0]
			word = item[1]

			if not parameter?
				throw new Error('Signature dismatch')

			if not parameter.matches(word)
				if parameter.isRequired()
					throw new Error("Missing #{parameter.getValue()}")

				throw new Error("#{parameter.getValue()} does not match #{word}")

			if parameter.isVariadic()
				parameterIndex = _.indexOf(@parameters, parameter)
				value = _.rest(commandWords, parameterIndex).join(' ')

				if parameter.isOptional() and _.isEmpty(value)
					return result

				result[parameter.getValue()] = value
				return result

			if not parameter.isWord() and word?
				result[parameter.getValue()] = _.parseInt(word) or word

		return result
