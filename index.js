const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next()
    });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rx4i6uo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {

        const phoneCategoriesCollection = client.db('PhoneReseller').collection('categories');
        const usersCollection = client.db('PhoneReseller').collection('users');
        const ordersCollection = client.db('PhoneReseller').collection('orders');

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


        // app.get('/categories', async (req, res) => {
        //     const query = {}
        //     const options = await phoneCategoriesCollection.find(query).toArray()

        //     //get the booking of the provided data
        //     const name = req.query.name;
        //     const orderQuery = { productName: name };
        //     const alreadyBooked = await phoneCategoriesCollection.find(orderQuery).toArray();

        //     // code carefully :D
        //     options.map(option => {
        //         const optionOrder = alreadyBooked.filter(order => order.name === option.name)
        //         const bookedSlots = optionOrder.map(book => book.name);
        //         const remainingSlots = option.products.filter(slot => !bookedSlots.includes(slot))
        //         option.slots = remainingSlots;
        //     })
        //     res.send(options)
        // })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result)
        })

        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            // const decodedEmail = req.decoded.email;
            // if (email !== decodedEmail) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }
            const query = { email: email }
            const orders = await ordersCollection.find(query).toArray()
            res.send(orders)
        });

        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const order = { _id: ObjectId(id) };
            const result = await ordersCollection.findOne(booking);
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