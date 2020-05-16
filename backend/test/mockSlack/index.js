const conversations = require('./data/conversations.json').conversations
const members = require('./data/members.json').members
const messages = require('./data/messages.json')
const replies = require('./data/replies.json')

const express = require('express')
const app = express()
const port = process.env.PORT || 8081

const CONVERSATIONS_BATCH = 100
const MEMBERS_BATCH = 100
const MESSAGES_BATCH = 100
const REPLIES_BATCH = 100
const MAX_REQUESTS_PER_SECOND = 5

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
            nextCursor = Math.random().toString()
        }
    } else if (cursor == cursors[name].cursor) {
        const index = cursors[name].index
        items = allItems.slice(index, index + batchSize)
        if (index + batchSize >= allItems.length) {
            nextIndex = 0
            nextCursor = null
        } else {
            nextIndex = index + batchSize
            nextCursor = Math.random().toString()
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


app.get('/', (req, res) => res.send('up'))

app.get('/oauth/authorize', (req, resp) => resp.status(501).send('TODO'))

app.get('/api/oauth.access', (req, resp) => resp.status(501).send('TODO'))

app.post('/api/auth.test', (req, resp) => resp.status(501).send('TODO'))

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

app.post('/api/auth.revoke', (req, resp) => resp.status(501).send('TODO'))

app.listen(port, () => console.log(`Slack Mock Server running on http://localhost:${port}`))
