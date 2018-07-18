_ = require('lodash')
async = require('async')
Parameter = require('./parameter')
settings = require('./settings')
parse = require('./parse')
utils = require('./utils')

isLastOne = (parameters, predicate) ->
	lastParameter = _.last(parameters)
	return predicate(lastParameter)

appearedMoreThanOnce = (parameters, predicate) ->
	filteredParameters = _.filter(parameters, predicate)
	return filteredParameters.length > 1

module.exports = class Signature
	constructor: (signature) ->

		if not signature? or not _.isString(signature)
			throw new Error('Missing or invalid signature')

		@parameters = []

		_.forEach parse.split(signature), (word) =>
			@_addParameter(word)

		if @allowsStdin()
			isStdin = (parameter) ->
				return parameter.allowsStdin()

			if appearedMoreThanOnce(@parameters, isStdin)
				throw new Error('Signature can only contain one stdin parameter')

			if not isLastOne(@parameters, isStdin)
				throw new Error('The stdin parameter should be the last one')

		if @hasVariadicParameters()
			isVariadic = (parameter) ->
				return parameter.isVariadic()

			if appearedMoreThanOnce(@parameters, isVariadic)
				throw new Error('Signature can only contain one variadic parameter')

			if not isLastOne(@parameters, isVariadic)
				throw new Error('The variadic parameter should be the last one')

	_addParameter: (word) ->
		parameter = new Parameter(word)
		@parameters.push(parameter)

	hasParameters: ->
		return _.some @parameters, (parameter) ->
			return not parameter.isWord()

	hasVariadicParameters: ->
		return _.some @parameters, (parameter) ->
			return parameter.isVariadic()

	allowsStdin: ->
		return _.some @parameters, (parameter) ->
			return parameter.allowsStdin()

	toString: ->
		result = []
		for parameter in @parameters
			result.push(parameter.toString())
		return result.join(' ')

	isWildcard: ->
		return _.every [
			@parameters.length is 1
			@parameters[0].toString() is settings.signatures.wildcard
		]

	# TODO: There should be a better way to implement
	# this algorithm without duplicating a big chunk of
	# compileParameters().
	# Maybe there should be a third function that these
	# two algorithms share?
	# Related to this issue, if a command accepts input from stdin
	# matches() calls compileParameters() thus causing compileParameters()
	# to be called twice per execution, one for testing the match command
	# and another one to actually do the real compilation.
	# Stdin can be grabbed once, so the result is grabbed by matches()
	# and when compileParameters() tries to fetch stdin again, there's
	# nothing else to retrieve.
	matches: (command, callback) ->
		@compileParameters command, (error) ->
			return callback(true) if not error?

			if _.startsWith(error.message, 'Missing')
				return callback(true)
			return callback(false)
		, false

	compileParameters: (command, callback, performStdin = true) ->
		commandWords = parse.split(command)
		comparison = _.zip(@parameters, commandWords)

		result = {}

		return callback(null, result) if @isWildcard()

		async.eachSeries comparison, (item, done) =>
			parameter = item[0]
			word = item[1]

			if not parameter?
				return callback(new Error('Signature dismatch'))

			parameterValue = parameter.getValue()

			if parameter.allowsStdin() and not word?

				# Used to prevent matches() to retrieve the
				# input from stdin.
				# TODO: This should be unnecessary once matches()
				# do not calls compileParameters() anymore.
				return callback(null, result) if not performStdin

				return utils.getStdin (stdin) ->

					if parameter.isRequired() and not stdin?
						return callback(new Error("Missing #{parameterValue}"))

					if stdin?
						result[parameterValue] = stdin

					return callback(null, result)

			if not parameter.matches(word)
				if parameter.isRequired()
					return callback(new Error("Missing #{parameterValue}"))

				return callback(new Error("#{parameterValue} does not match #{word}"))

			if parameter.isVariadic()
				parameterIndex = _.indexOf(@parameters, parameter)
				value = _.slice(commandWords, parameterIndex).join(' ')

				if parameter.isOptional() and _.isEmpty(value)
					return callback(null, result)

				result[parameterValue] = value
				return callback(null, result)

			if not parameter.isWord() and word?
				if /^\d+$/.test(word)
					result[parameterValue] = _.parseInt(word)
				else
					result[parameterValue] = word

			return done()

		, (error) ->
			return callback(error) if error?
			return callback(null, result)
