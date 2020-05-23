require('dotenv').config()
const conversations = require('./data/conversations.json').conversations
const members = require('./data/members.json').members
const messages = require('./data/messages.json')
const replies = require('./data/replies.json')
const uuid = require('uuid').v4;
const bodyParser = require('body-parser')

const express = require('express')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
const port = process.env.MOCK_SLACK_PORT

const CONVERSATIONS_BATCH = 100
const MEMBERS_BATCH = 100
const MESSAGES_BATCH = 100
const REPLIES_BATCH = 100
const MAX_REQUESTS_PER_SECOND = 5
const USER_ID = members[Math.floor(Math.random() * members.length)].id

const cursors = {
    members: {
        index: 0,
        cursor: null
    },
    conversations: {
        index: 0,
        cursor: null
    },
    messages: {
        index: 0,
        cursor: null
    },
    replies: {
        index: 0,
        cursor: null
    }
}

const getItems = (name, cursor, allItems, batchSize) => {
    let nextCursor
    let nextIndex
    let items

    if (!cursor) {
        items = allItems.slice(0, batchSize)
        if (items.length < allItems.length) {
            nextIndex = batchSize
            nextCursor = uuid()
        }
    } else if (cursor == cursors[name].cursor) {
        const index = cursors[name].index
        items = allItems.slice(index, index + batchSize)
        if (index + batchSize >= allItems.length) {
            nextIndex = 0
            nextCursor = null
        } else {
            nextIndex = index + batchSize
            nextCursor = uuid()
        }
    } else {
        return { items: null }
    }

    cursors[name] = { index: nextIndex, cursor: nextCursor }

    return { items, nextCursor }
}


let requestsPerSecond = 0
let timer = null
let tooManyRequests = false
let authCode = null
let accessToken = null


app.get('/', (req, res) => res.send('up'))

app.get('/oauth/authorize', (req, resp) => {
    authCode = uuid()
    const redirect = req.query.redirect_uri
    const state = req.query.state

    resp.status(302).send(`${redirect}?code=${authCode}&state=${encodeURIComponent(state)}`)
})

app.post('/api/oauth.access', (req, resp) => {
    const auth = req.headers['authorization'] || "";
    const token = Buffer.from(auth.match(/Basic (.*)/)[1], 'base64').toString() || "";
    const [clientId, clientSecret] = token.split(':');

    if (clientId !== process.env.SLACK_CLIENT_ID) {
        resp.status(200).send({
            ok: false,
            error: "invalid_client_id"
        })
    } else if (clientSecret !== process.env.SLACK_CLIENT_SECRET) {
        resp.status(200).send({
            ok: false,
            error: "bad_client_secret"
        })
    } else if (req.body.code !== authCode) {
        resp.status(200).send({
            ok: false,
            error: "invalid_code"
        })
    } else {
        accessToken = uuid()
        resp.status(200).send({
            ok: true,
            access_token: accessToken,
            user_id: USER_ID
        })
    }
})

// auth middleware
app.use((req, resp, next) => {
    const token = ((req.headers.authorization || "").match('Bearer (.*)') || [])[1]

    if (token != null && token === accessToken) {
        next()
    } else {
        resp.status(200).send({
            ok: false,
            error: "invalid_auth"
        })
    }
})

app.post('/api/auth.test', (req, resp) => {
    resp.status(200).send({
        ok: true
    })
})

app.post('/api/auth.revoke', (req, resp) => {
    accessToken = null
    resp.send({
        ok: true
    })
})

// rate limiting simulation middleware
app.use((req, resp, next) => {
    if (tooManyRequests) {
        resp.status(429).set('Retry-After', '2').send()
        return
    }

    if (timer == null) {
        timer = setTimeout(() => {
            requestsPerSecond = 0
            timer = null
        }, 1000)
    }

    if (++requestsPerSecond == MAX_REQUESTS_PER_SECOND) {
        tooManyRequests = true;
        setTimeout(() => { tooManyRequests = false }, 2000)
    }

    next()
})

app.get('/api/conversations.list', (req, resp) => {
    const { items, nextCursor } = getItems('conversations', req.query.cursor, conversations, CONVERSATIONS_BATCH)

    if (items == null) {
        resp.status(200).send({ ok: false, error: "invalid_cursor" })
        return
    }

    resp.status(200).send({
        ok: true,
        channels: items,
        response_metadata: {
            next_cursor: nextCursor || ""
        }
    })
})

app.get('/api/users.list', (req, resp) => {
    const { items, nextCursor } = getItems('members', req.query.cursor, members, MEMBERS_BATCH)

    if (items == null) {
        resp.status(200).send({ ok: false, error: "invalid_cursor" })
        return
    }

    resp.status(200).send({
        ok: true,
        members: items,
        response_metadata: {
            next_cursor: nextCursor || ""
        }
    })
})

app.get('/api/conversations.history', (req, resp) => {
    const channel = req.query.channel

    if (!messages[channel]) {
        resp.status(200).send({ ok: false, error: "channel_not_found" })
        return
    }

    const { items, nextCursor } = getItems('messages', req.query.cursor, messages[channel], MESSAGES_BATCH)

    if (items == null) {
        resp.status(200).send({ ok: false, error: "invalid_cursor" })
        return
    }

    resp.status(200).send({
        ok: true,
        messages: items,
        response_metadata: {
            next_cursor: nextCursor || ""
        }
    })
})

app.get('/api/conversations.replies', (req, resp) => {
    const channel = req.query.channel
    const thread = req.query.ts

    if (!replies[channel]) {
        resp.status(200).send({ ok: false, error: "channel_not_found" })
        return
    } else if (!replies[channel][thread]) {
        resp.status(200).send({ ok: false, error: "thread_not_found" })
        return
    }

    const { items, nextCursor } = getItems('replies', req.query.cursor, replies[channel][thread], REPLIES_BATCH)

    if (items == null) {
        resp.status(200).send({ ok: false, error: "invalid_cursor" })
        return
    }

    resp.status(200).send({
        ok: true,
        messages: items,
        response_metadata: {
            next_cursor: nextCursor || ""
        }
    })
})

app.listen(port, () => console.log(`Slack Mock Server running on http://localhost:${port}`))
