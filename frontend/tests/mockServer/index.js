const express = require('express')
const app = express()
const fs = require('fs')
const port = 3000
const messages = require('./messages.json').messages
const members = require('./members.json')

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

app.get('/v1/members/:id', async (req, res) => {
  const id = req.params.id

  const member = members[id]

  if (!member) {
    res.status(404).send()
    return
  }

  res.json(member)
})

app.get('/images/:file', (req, resp) => {
  const file = req.params.file
  fs.readFile('./tests/mockServer/images/' + file, (err, data) => {
    if (err) {
      console.log(err)
      resp.status(404).send()
    } else {
      console.log('success')
      resp
        .set('Content-Type', 'image/png')
        .status(200)
        .send(data)
    }
  })
})

app.listen(port, () => console.log(`Mock server: http://localhost:${port}`))
