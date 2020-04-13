const express = require('express')
const app = express()
const port = 3000

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
})

app.get('/', (req, res) => res.send('up'))

app.listen(port, () => console.log(`Mock server: http://localhost:${port}`))
