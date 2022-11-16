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

const randomItem = (items) => {
    return items[randomNumber(items.length)]
}

const randomItems = (items, n) => {
    const shuffledItems = Array.from(items).sort(() => 0.5 - Math.random())
    return shuffledItems.slice(0, n)
}

module.exports = {
    randomNumber,
    randomChance,
    randomItem,
    randomItems
}