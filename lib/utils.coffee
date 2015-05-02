stdin = require('get-stdin')
isElevated = require('is-elevated')

# Wrap lonely functions for stubbing purposes
exports.getStdin = stdin
exports.isElevated = isElevated
