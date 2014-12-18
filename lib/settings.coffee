module.exports =
	signatures:
		wildcard: '*'

	actions:
		commandNotFound: (command) ->
			if command?
				console.error("Command not found: #{command}")
			process.exit(1)

		onError: (error) ->
			console.error(error.message)
			process.exit(1)
