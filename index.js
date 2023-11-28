const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2ewf2fa.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        const userCollection = client.db('The-News-Hunter').collection('users');
        const newsCollection = client.db('The-News-Hunter').collection('news');
        const publisherCollection = client.db('The-News-Hunter').collection('publisher');

        // await client.connect();
        //post user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            } 
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        //get all news
        app.get('/news', async (req, res) => {
            const cursor = newsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        //get single news
        app.get('/news/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await newsCollection.findOne(query);
            res.send(result);
        })

        //post news
        app.post('/news', async (req, res) => {
            const news = req.body;
            const result = await newsCollection.insertOne(news);
            res.send(result);
        })

        //delete a news
        app.delete('/news/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await newsCollection.deleteOne(query);
            res.send(result);
        })

        //update a news
        app.put('/news/:id', async (req, res) => {
            const id = req.params.id;
            const updatednews = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const update = {
                $set: updatednews,
            }
            const result = await newsCollection.updateOne(filter, update, options);
            res.send(result);
        })



        //update view count
        app.put('/news/view/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const update = { $inc: { views: 1 } };
            const options = { returnOriginal: false };
            const result = await newsCollection.findOneAndUpdate(query, update, options);
            res.send(result.value);
        });



        //get all publisher
        app.get('/publisher', async (req, res) => {
            const query = {};
            const cursor = publisherCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        //get single publisher
        app.get('/publisher/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await publisherCollection.findOne(query);
            res.send(result);
        })

        //post publisher
        app.post('/publisher', async (req, res) => {
            const publisher = req.body;
            const result = await publisherCollection.insertOne(publisher);
            res.send(result);
        })

        //delete a publisher
        app.delete('/publisher/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await publisherCollection.deleteOne(query);
            res.send(result);
        })

        //update a publisher
        app.put('/publisher/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const update = { $set: req.body };
            const options = { returnOriginal: false };
            const result = await publisherCollection.findOneAndUpdate(query, update, options);
            res.send(result.value);
        })







        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('The News Hunter Server is running!')
})

app.listen(port, () => {
    console.log(`The News Hunter Server is running on port: ${port}`)
})
