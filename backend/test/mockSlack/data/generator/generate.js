const fs = require('fs')
const lipsums = require('./lipsums.json').lipsums
const path = require('path')
const profilePictures = require('./profilePictures.json').profilePictures

const RANDOM_TIME_MIN = 5 * 1000
const RANDOM_TIME_MAX = 48 * 60 * 60 * 1000
const MAX_MEMBERS = 10
const MAX_CONVERSATIONS = 5
const MAX_MESSAGES = 500
const MAX_REPLIES = 120
const THREAD_PROBABILITY = 0.1
const THREAD_BROADCAST_PROBABILITY = 0.005

const randomNumber = (n, n1) => {
    if (n1 == null) {
        return Math.floor(Math.random() * n)
    } else {
        return Math.floor(Math.random() * (n1 - n)) + n
    }
}

const randomChance = (prob) => {
    return Math.random() <= prob
}

const randomText = () => {
    return lipsums[Math.floor(Math.random() * lipsums.length)]
}

const randomString = (n) => {
    var options = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const randomChar = () => options[Math.floor(Math.random() * options.length)]
    let s = ''

    for (let i = 0; i < n; i++) {
        s += randomChar()
    }

    return s
}

const randomItem = (items) => {
    return items[randomNumber(items.length)]
}


const randomUserId = (users) => {
    return users[Math.floor(Math.random() * users.length)].id
}

const randomUserIds = (users, n) => {
    const userIds = users.map(u => u.id).sort(() => 0.5 - Math.random())
    return userIds.slice(0, n)
}

const compareTs = (a, b) => {
    if (a.ts > b.ts) {
        return 1
    } else if (b.ts > a.ts) {
        return -1
    } else {
        return 0
    }
}

const getProfileImage = () => profilePictures.pop()

const toSlackTs = time => Math.floor(time/1000).toString() + '.000000'

const toMillis = ts => parseInt(ts) * 1000

const addRandomTime = (ts) => {
    return toSlackTs(toMillis(ts) + randomNumber(RANDOM_TIME_MIN, RANDOM_TIME_MAX))
}

const subtractRandomTime = (ts) => {
    return toSlackTs(toMillis(ts) - randomNumber(RANDOM_TIME_MIN, RANDOM_TIME_MAX))
}

const writeJsonFile = (file, json) => {
    fs.writeFile(file, JSON.stringify(json, null, 2), () => {})
}

const TEAM_ID = 'T' + randomString(8)

const generateMember = () => {
    const firstName = 'User'
    const lastName = randomString(2)
    const name = 'user-' + lastName
    const realName = firstName + ' ' + lastName
    const image = getProfileImage()

    return {
        "id": 'U' + randomString(8),
        "team_id": TEAM_ID,
        "name": name,
        "deleted": false,
        "color": "674b1b",
        "real_name": realName,
        "tz": "Asia/Kolkata",
        "tz_label": "India Standard Time",
        "tz_offset": 19800,
        "profile": {
            "title": "",
            "phone": "",
            "skype": "",
            "real_name": realName,
            "real_name_normalized": realName,
            "display_name": realName,
            "display_name_normalized": realName,
            "status_text": "",
            "status_emoji": "",
            "status_expiration": 0,
            "avatar_hash": "03603c335dd0",
            "image_original": image,
            "is_custom_image": true,
            "first_name": firstName,
            "last_name": lastName,
            "image_24": image,
            "image_32": image,
            "image_48": image,
            "image_72": image,
            "image_192": image,
            "image_512": image,
            "image_1024": image,
            "status_text_canonical": "",
            "team": TEAM_ID
        },
        "is_admin": false,
        "is_owner": false,
        "is_primary_owner": false,
        "is_restricted": false,
        "is_ultra_restricted": false,
        "is_bot": false,
        "is_app_user": false,
        "updated": 1582685614,
        "has_2fa": false
    }
}

const generateConversation = (members) => {
    const name = 'channel-' + randomString(3)

    return {
        "id": 'C' + randomString(8),
        "name": name,
        "is_channel": true,
        "is_group": false,
        "is_im": false,
        "created": 1521661315,
        "is_archived": false,
        "is_general": false,
        "unlinked": 0,
        "name_normalized": name,
        "is_shared": false,
        "parent_conversation": null,
        "creator": randomUserId(members),
        "is_ext_shared": false,
        "is_org_shared": false,
        "shared_team_ids": [
            "T00000000"
        ],
        "pending_shared": [],
        "pending_connected_team_ids": [],
        "is_pending_ext_shared": false,
        "is_member": true,
        "is_private": false,
        "is_mpim": false,
        "topic": {
            "value": randomText(),
            "creator": randomUserId(members),
            "last_set": 1521800393
        },
        "purpose": {
            "value": randomText(),
            "creator": randomUserId(members),
            "last_set": 1521800393
        },
        "num_members": randomNumber(MAX_MEMBERS) + 1
    }
}

const generateMessage = (previousTs, members) => {
    return {
        "client_msg_id": "5b939cac-c863-4d4e-974d-78ecaab543d1",
        "type": "message",
        "text": randomText(),
        "user": randomUserId(members),
        "ts": subtractRandomTime(previousTs),
        "team": TEAM_ID
    }
}

const generateThreadParent = (previousTs, members) => {
    const replyUsersCount = randomNumber(MAX_MEMBERS) + 1
    const ts = subtractRandomTime(previousTs)

    return {
        "client_msg_id": "0ce92bb0-23fc-4016-9e5d-de4efdf238e2",
        "type": "message",
        "text": randomText(),
        "user": randomUserId(members),
        "ts": ts,
        "team": TEAM_ID,
        "thread_ts": ts,
        "reply_count": randomNumber(MAX_REPLIES) + 1,
        "reply_users_count": replyUsersCount,
        "latest_reply": "", // idc
        "reply_users": randomUserIds(members, replyUsersCount),
        "subscribed": true,
        "last_read": "" // idc
    }
}

const generateThreadReply = (parentTs, parentUserId, replyUsers, previousTs) => {
    return {
        "client_msg_id": "96f5ad82-f802-44c5-a63f-75453f78ab3e",
        "type": "message",
        "text": randomText(),
        "user": randomItem(replyUsers),
        "ts": addRandomTime(previousTs),
        "team": TEAM_ID,
        "thread_ts": parentTs,
        "parent_user_id": parentUserId
    }
}

const generateThreadBroadcast = (parentMessage, replyUsers, previousTs) => {
    return {
        "type": "message",
        "subtype": "thread_broadcast",
        "text": randomText(),
        "user": randomItem(replyUsers),
        "ts": addRandomTime(previousTs),
        "thread_ts": parentMessage.ts,
        "root": parentMessage,
        "client_msg_id": "5B36401D-42A8-4CF1-A1E7-DFEBEC1C4042"
    }
}

const generateMembers = () => {

    const members = []

    for (let i = 0; i < MAX_MEMBERS; i++) {
        members.push(generateMember())
    }

    return members
}

const generateConversations = () => {

    const conversations = []

    for (let i = 0; i < MAX_CONVERSATIONS; i++) {
        conversations.push(generateConversation(members))
    }

    return conversations
}

const generateMessages = (members) => {

    let messages = []
    const replies = {}
    const threadBroadcasts = []

    let lastTs = toSlackTs(Date.now())

    for (let i = 0; i < MAX_MESSAGES; i++) {
        const makeThread = randomChance(THREAD_PROBABILITY)
        let message

        if (makeThread) {
            message = generateThreadParent(lastTs, members)
            replies[message.ts] = [message]

            const replyUsers = randomUserIds(members, message.reply_count)
            let lastReplyTs = message.ts

            for (let i = 0; i < message.reply_count; i++) {
                const makeBroadcast = randomChance(THREAD_BROADCAST_PROBABILITY)
                let reply

                if (makeBroadcast) {
                    reply = generateThreadBroadcast(message, replyUsers, lastReplyTs)
                    threadBroadcasts.push(reply)
                } else {
                    reply = generateThreadReply(message.ts, message.user, replyUsers, lastReplyTs)
                }

                lastReplyTs = reply.ts
                replies[message.ts].push(reply)
            }
        } else {
            message = generateMessage(lastTs, members)
        }

        lastTs = message.ts
        messages.push(message)
    }

    messages = messages.concat(threadBroadcasts).sort((a, b) => -(compareTs(a, b)))

    return { messages, replies }
}

const members = generateMembers()

const conversations = generateConversations(members)

const { messages, replies } = conversations.reduce(
    ({ messages, replies }, conversation) => {
        const generated = generateMessages(members)
        messages[conversation.id] = generated.messages
        replies[conversation.id] = generated.replies
        return { messages, replies }
    },
    { messages: {}, replies: {} }
)

writeJsonFile(path.resolve(__dirname, '../conversations.json'), { conversations })
writeJsonFile(path.resolve(__dirname, '../members.json'), { members })
writeJsonFile(path.resolve(__dirname, '../messages.json'), messages)
writeJsonFile(path.resolve(__dirname, '../replies.json'), replies)
