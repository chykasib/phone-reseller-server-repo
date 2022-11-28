const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()


app.use(cors())
app.use(express.json())

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
        const paymentCollection = client.db('PhoneReseller').collection('payment');
        const addProductCollection = client.db('PhoneReseller').collection('addProduct');


        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next()
        }

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' })
                return res.send({ accessToken: token })
            }
            else {
                return res.status(401).send({ message: 'unauthorized access' })
            }
        })

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

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray()
            res.send(users)
        })
        // Admin part 
        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })
        })


        app.delete('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const user = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(user);
            res.send(result);
        })

        // seller part
        app.put('/users/seller/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'seller'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' })
        })
        app.delete('/users/seller/:id', async (req, res) => {
            const id = req.params.id;
            const user = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(user);
            res.send(result);
        })

        // buyers
        app.delete('/users/buyer/:id', async (req, res) => {
            const id = req.params.id;
            const user = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(user);
            res.send(result);
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
            const result = await ordersCollection.findOne(order);
            res.send(result)
        })

        app.post('/addProduct', async (req, res) => {
            const query = req.body;
            const result = await addProductCollection.insertOne(query);
            res.send(result)
        })

        app.delete('/addProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await addProductCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/addProduct', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            result = await addProductCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/addProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const products = await addProductCollection.findOne(query)
            res.send(products)

        })

        app.post('/create-payment-intent', async (req, res) => {
            const order = req.body;
            const price = order.resalePrice;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "bdt",
                "payment_method_types": [
                    "card"
                ],
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        })

        app.post('/payment', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment);
            const id = payment.orderId;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updateResult = await ordersCollection.updateOne(filter, updateDoc);
            res.send(result);
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