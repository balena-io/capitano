stdin = require('get-stdin')

# Wrap stdin in order to being able to mock it with Sinon.
exports.getStdin = stdin
