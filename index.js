const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rx4i6uo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {

        const phoneCategoriesCollection = client.db('PhoneReseller').collection('categories');
        const usersCollection = client.db('PhoneReseller').collection('users');

        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await phoneCategoriesCollection.find(query).toArray()
            res.send(categories);
        })


        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const products = await phoneCategoriesCollection.findOne(query)
            res.send(products)

        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })


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