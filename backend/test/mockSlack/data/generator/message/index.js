const messageTemplate = require('./message.json');
const { TextGenerator } = require('../text');
const { randomItem, randomItems, randomChance, randomNumber } = require('../random');

const compareTs = (a, b) => {
    if (a.ts > b.ts) {
        return 1
    } else if (b.ts > a.ts) {
        return -1
    } else {
        return 0
    }
}

const toSlackTs = time => Math.floor(time / 1000).toString() + '.000000'

const toMillis = ts => parseInt(ts) * 1000

class TimestampGenerator {
    constructor(maxTimeDiff, minTimeDiff, startTimestamp) {
        this.maxTimeDiff = maxTimeDiff;
        this.minTimeDiff = minTimeDiff;
        this.ts = startTimestamp;
        this._previouslyGenerated = {};
    }

    addRandomTime (ts) {
        return toSlackTs(toMillis(ts) + randomNumber(this.minTimeDiff, this.maxTimeDiff))
    }

    subtractRandomTime (ts) {
        return toSlackTs(toMillis(ts) - randomNumber(this.minTimeDiff, this.maxTimeDiff))
    }

    increaseTimestampPart (ts) {
        let [seconds, part] = ts.split('.').map(n => parseInt(n));
        part += 100;
        const padding = '0'.repeat(6 - part.toString().length);
        return seconds.toString() + '.' + padding + part.toString();
    }

    next() {
        let nextTs = this._isThread ? this.addRandomTime(this.ts) : this.subtractRandomTime(this.ts);

        while (this._previouslyGenerated[nextTs]) {
            // prevent duplicate
            nextTs = this.increaseTimestampPart(nextTs);
        }

        this._previouslyGenerated[nextTs] = true;

        this.ts = nextTs;

        return nextTs;
    }

    thread(threadTimestamp) {
        const threadTimestampGenerator = new TimestampGenerator(this.maxTimeDiff, this.minTimeDiff, threadTimestamp);
        threadTimestampGenerator._isThread = true;
        threadTimestampGenerator._previouslyGenerated = this._previouslyGenerated;

        return threadTimestampGenerator;
    }
}

class MessageGenerator {
    constructor (options) {
        this.textGenerator = new TextGenerator();
        this.members = options.members;
        this.teamId = options.teamId;
        this.maxMessages = options.maxMessages;
        this.maxReplies = options.maxReplies;
        this.maxTimeDiff = options.maxTimeDiff;
        this.minTimeDiff = options.minTimeDiff;
        this.threadProbability = options.threadProbability;
        this.broadcastProbability = options.broadcastProbability;
        this.generated = { total: 0, posts: 0, threads: 0, replies: 0 }
    }

    generateMessage (timestamp) {
        const message = JSON.parse(JSON.stringify(messageTemplate.plain_message));
        message.text = this.textGenerator.generateSentence();
        message.user = randomItem(this.members).id;
        message.ts = timestamp;
        message.team = this.teamId;

        this.generated.total++;
        this.generated.posts++;

        return message;
    }

    generateThreadParent (timestamp,) {
        const replyUsersCount = randomNumber(this.members.length) + 1;
        const message = JSON.parse(JSON.stringify(messageTemplate.thread_parent));

        message.text = this.textGenerator.generateSentence();
        message.user = randomItem(this.members).id;
        message.ts = timestamp;
        message.team = this.teamId;
        message.thread_ts = timestamp;
        message.reply_count = randomNumber(this.maxReplies) + 1;
        message.reply_users_count = replyUsersCount;

        this.generated.total++;
        this.generated.posts++;

        return message;
    }

    generateThreadReply (timestamp, parent) {
        const message = JSON.parse(JSON.stringify(messageTemplate.thread_reply));

        message.text = this.textGenerator.generateSentence();
        message.user = randomItem(this.members).id;
        message.ts = timestamp;
        message.team = this.teamId;
        message.thread_ts = parent.ts;
        message.parent_user_id = parent.user;

        this.generated.total++;
        this.generated.replies++;

        return message;
    }

    generateThreadBroadcast (timestamp, parent) {
        const message = JSON.parse(JSON.stringify(messageTemplate.thread_broadcast));

        message.text = this.textGenerator.generateSentence();
        message.user = randomItem(this.members).id;
        message.ts = timestamp;
        message.thread_ts = parent.ts;
        message.root = parent;

        this.generated.total++;
        this.generated.posts++;

        return message;
    }

    generateThread(timestampGenerator) {
        const parentTimestamp = timestampGenerator.next();
        const parent = this.generateThreadParent(parentTimestamp, this.members)
        const replies = [parent];

        const replyTsGenerator = timestampGenerator.thread(parentTimestamp);
        const nextTs = () => replyTsGenerator.next()

        for (let i = 0, ts = nextTs(); (i < parent.reply_count) && (ts <= toSlackTs(Date.now())); i++, ts = nextTs()) {
            const makeBroadcast = randomChance(this.broadcastProbability);
            let reply

            if (makeBroadcast) {
                reply = this.generateThreadBroadcast(replyTsGenerator.next(), parent);
            } else {
                reply = this.generateThreadReply(replyTsGenerator.next(), parent);
            }

            replies.push(reply);
        }

        // fewer than expected replies could have been generated if the generated timestamps
        // were starting to cross the current time. Update parent.reply_count with
        // the smaller number if that happened
        parent.reply_count = Math.min(parent.reply_count, replies.length - 1)

        this.generated.threads++;

        parent.reply_users = replies
            .slice(1) // skip parent itself
            .map(m => m.user)
            .filter((m, i, users) => users.indexOf(m) === i); // no duplicates

        return replies;
    }

    generateMessages () {
        let messages = []
        const replies = {}
        let threadBroadcasts = []

        const timestampGenerator = new TimestampGenerator(this.maxTimeDiff, this.minTimeDiff, toSlackTs(Date.now()));

        for (let i = 0; i < this.maxMessages; i++) {
            const makeThread = randomChance(this.threadProbability)
            let message

            if (makeThread) {
                const thread = this.generateThread(timestampGenerator);
                const broadcasts = thread.filter(m => m.subtype === 'thread_broadcast');
                message = thread[0];
                replies[message.ts] = thread;
                threadBroadcasts = threadBroadcasts.concat(broadcasts);
            } else {
                message = this.generateMessage(timestampGenerator.next());
            }

            messages.push(message)
        }

        messages = messages.concat(threadBroadcasts).sort((a, b) => -(compareTs(a, b)))

        return { messages, replies }
    }
}

module.exports = {
    MessageGenerator,
    TimestampGenerator
}