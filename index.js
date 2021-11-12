const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()
const port = process.env.PORT || 5005

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pdsxi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()
        const database = client.db("vehica_car_house")
        const productsCollection = database.collection("products")
        const ordersCollection = database.collection("orders")
        const reviewsCollection = database.collection("reviews")
        const usersCollection = database.collection("users")
        // get products
        app.get('/products', async (req, res) => {
            const products = await productsCollection.find({}).toArray()
            res.json(products)
        })
        // add new product api
        app.post('/products', async (req, res) => {
            const newProducts = await productsCollection.insertOne(req.body)
            res.json(newProducts)
        })
        // orders post api
        app.post('/orders', async (req, res) => {
            const orders = await ordersCollection.insertOne(req.body)
            res.json(orders)
        })
        // review post api
        app.post('/reviews', async (req, res) => {
            const reviews = await reviewsCollection.insertOne(req.body)
            res.json(reviews)
        })
        // user post api
        app.post('/users', async (req, res) => {
            const users = await usersCollection.insertOne(req.body)
            res.json(users)
        })
        // user put api
        app.put('/users', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })
        app.put('/users/admin', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const updateDoc = {
                $set: { role: 'admin' }
            };
            const admin = await usersCollection.updateOne(filter, updateDoc)
            res.json(admin)
        })
        // get adim
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const user = await usersCollection.findOne(filter)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true
            }
            res.json({ admin: isAdmin })
        })
        // get review api
        app.get('/reviews', async (req, res) => {
            const userReview = await reviewsCollection.find({}).toArray()
            res.json(userReview)
        })
        // get user orders
        app.get('/myOrders/:email', async (req, res) => {
            const email = req.params.email
            const orders = await ordersCollection.find({ email: email }).toArray()
            res.json(orders)
        })
        // get maganae order
        app.get('/manageOrders', async (req, res) => {
            const manageOrders = await ordersCollection.find({}).toArray()
            res.json(manageOrders)
        })
        // put manage order
        app.put('/manageOrder/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const updateDoc = { $set: { status: req.body.status } }
            const statusShipped = await ordersCollection.updateOne(filter, updateDoc)
            res.json(statusShipped)
            console.log(statusShipped)
        })
        // delete my orders
        app.delete('/myOrders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.json(result)
        })
    }
    finally {

    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('connected server')
})

app.listen(port, () => {
    console.log('connected port', port)
})
