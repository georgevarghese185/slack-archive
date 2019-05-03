
const getConfig = function() {
  const port = process.env.PORT || 8080
  const url = process.env.SERVER_URL || ("http://localhost:" + port)

  return {
    port,
    url
  }
}

module.exports = getConfig
