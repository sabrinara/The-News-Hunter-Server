const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://the-news-hunter.netlify.app'],
    credentials: true,
}));
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
        const usersCollection = client.db('The-News-Hunter').collection('users');
        const newsCollection = client.db('The-News-Hunter').collection('news');
        const publisherCollection = client.db('The-News-Hunter').collection('publisher');

        // await client.connect();
        // get all users
        app.get('/users', async (req, res) => {
            try {
                const users = await usersCollection.find().toArray();
                res.json(users);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
        


        // get user by email
        app.get("/users/:email", async (req, res) => {
            try {
                const email = req.params.email;
                const query = { email: email };
                const user = await usersCollection.findOne(query);

                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }

                res.json(user);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal server error" });
            }
        });


        // role update
        app.patch("/users/:id", async (req, res) => {
            try {
                const { id } = req.params;
                const { role } = req.body;
        
                // Validate the role to prevent unauthorized role changes (optional)
                const validRoles = ["user", "editor", "admin"];
                if (!validRoles.includes(role)) {
                    return res.status(400).json({ error: "Invalid role" });
                }
        
                const updatedUser = await usersCollection.findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    { $set: { role } },
                    { returnOriginal: false } // Return the updated document
                );
        
                if (!updatedUser.value) {
                    return res.status(404).json({ error: "User not found" });
                }
        
                res.json(updatedUser.value);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
        //get user by id
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.findOne(query);
            res.send(result);
        });

        
        
        // post user
        app.post('/users', async (req, res) => {
            try {
                const user = req.body;
                // Validate user data here (e.g., required fields)

                const query = { email: user.email };
                const existingUser = await usersCollection.findOne(query);

                if (existingUser) {
                    return res.status(409).json({ message: 'User already exists', insertedId: null });
                }

                const result = await usersCollection.insertOne(user);
                res.json(result);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
        // update user profile by name and image 
        app.patch("/users/:email", async (req, res) => {
            try {
                const { email } = req.params;
                const { name, image } = req.body;

                if (!ObjectId.isValid(email)) {
                    return res.status(400).json({ error: "Invalid user ID" });
                }

                const updatedUser = await usersCollection.findOneAndUpdate(
                    { _id: new ObjectId(email) },
                    { $set: { name, image } },
                    { returnOriginal: false }
                );

                if (!updatedUser.value) {
                    return res.status(404).json({ error: "User not found" });
                }

                res.json(updatedUser.value);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal server error" });
            }
        })
       //delete user
       app.delete('/users/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.deleteOne(query);
        res.send(result);
    });
      


        // news updates status
        app.patch("/news/:id", async (req, res) => {
            try {
                const { id } = req.params;
                const { status } = req.body;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ error: "Invalid products ID" });
                }

                const updatedProducts = await newsCollection.findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    { $set: { status } },
                    { returnOriginal: false }
                );

                if (!updatedProducts.value) {
                    return res.status(404).json({ error: "products not found" });
                }

                res.json(updatedProducts.value);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal server error" });
            }
        });


        //get all news
        app.get('/news', async (req, res) => {
            const cursor = newsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Get single news
        app.get('/news/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await newsCollection.findOne(query);
            res.send(result);
        });

        // Post news
        app.post('/news', async (req, res) => {
            const newss = req.body;
            console.log("hit the post api", newss);
            const result = await newsCollection.insertOne(newss);
            res.send(result);
          });
        

        // Delete a news
        app.delete('/news/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await newsCollection.deleteOne(query);
            res.send(result);
        });

        // Update a news
        app.put("/news/:id", async (req, res) => {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ error: "Invalid news ID" });
            }

            const updatedNews = req.body;

            const result = await newsCollection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updatedNews },
                { returnOriginal: false }
            );

            if (!result.value) {
                return res.status(404).json({ error: "News article not found" });
            }

            res.json(result.value);
        });


        // Update view count
        app.put('/news/view/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const update = { $inc: { views: 1 } };
            const options = { returnOriginal: false };
            const result = await newsCollection.findOneAndUpdate(query, update, options);
            res.send(result.value);
        });

        // Approve or Decline an article
        app.patch('/news/approve/:id', async (req, res) => {
            const id = req.params.id;
            const { status, declineReason } = req.body;

            const query = { _id: new ObjectId(id) };
            const update = status === 'approved'
                ? { $set: { status: 'approved' } }
                : { $set: { status: 'declined', declineReason } };

            const options = { returnOriginal: false };
            const result = await newsCollection.findOneAndUpdate(query, update, options);

            res.send(result.value);
        });

        // Make an article premium
        app.patch('/news/premium/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };
            const update = { $set: { isPremium: true } };

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
        //publisher approve
        app.patch('/publisher/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const update = { $set: { status: 'approved', role:'editor'  } };
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
