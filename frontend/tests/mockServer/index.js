const express = require('express')
const app = express()
const port = 3000
const messages = require('./messages.json').messages

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  next()
})

app.get('/', (req, res) => res.send('up'))

app.get('/v1/messages', async (req, res) => {
  const { from, after, to, before, limit } = req.query || {}

  await new Promise((resolve) => setTimeout(resolve, 1000))

  let responseMessages = messages.slice()

  if (from) {
    responseMessages = responseMessages.filter(m => m.ts >= from)
  }

  if (after) {
    responseMessages = responseMessages.filter(m => m.ts > after)
  }

  if (to) {
    responseMessages = responseMessages.filter(m => m.ts <= to)
  }

  if (before) {
    responseMessages = responseMessages.filter(m => m.ts < before)
  }

  responseMessages = responseMessages.sort().reverse()

  if ((from || after)) {
    responseMessages = responseMessages.slice(0, limit || 100)
  } else {
    responseMessages = responseMessages.slice(-(limit || 100))
  }

  res.json({ messages: responseMessages })
})

app.listen(port, () => console.log(`Mock server: http://localhost:${port}`))
