const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
require('dotenv').config()


app.use(cors())
app.use(express.json())

async function run() {
    try {

    }
    finally {

    }
}
run().catch(error => console.error(error))
app.get('/', (req, res) => {
    res.send('mobile Resale running')
})

app.listen(port, () => {
    console.log(`mobile Resale platform coming soon ${port}`)
})