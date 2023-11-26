const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://process.env.DB_USER:process.env.DB_PASS@cluster0.2ewf2fa.mongodb.net/?retryWrites=true&w=majority`;

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

        // await client.connect();
        //get all news
        app.get('/news', async (req, res) => {
            const query = {};
            const cursor = newsCollection.find(query);
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
            const query = { _id: new ObjectId(id) };
            const update = { $set: req.body };
            const options = { returnOriginal: false };
            const result = await newsCollection.findOneAndUpdate(query, update, options);
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
