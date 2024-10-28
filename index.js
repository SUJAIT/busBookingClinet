const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware start
app.use(cors());
app.use(express.json());
// middleware end

// mongodb 
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const uri = "mongodb+srv://mdsujait2004:l84HKAl4LK5moInz@busbooking.eswwl.mongodb.net/?retryWrites=true&w=majority&appName=busbooking";
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
      await client.connect();

// all collactions
      const userCollection = client.db("booking").collection("users");
      const adminUserCollection = client.db("bookingAdmin").collection("adminusers");
      const busInfoCollection = client.db("bookingAdmin").collection("bus");
//

//admin users api
app.get('/adminusers',async(req,res) =>{
  const result = await adminUserCollection.find().toArray();
  res.send(result)
})
//
//AdminUser information crate and send api 
app.post('/adminusers', async (req,res) => {
  const user = req.body;
  //Checked userCollection Email Present or Not
  const query = { email: user.email }
  const existingUser = await adminUserCollection.findOne(query)
  if (existingUser) {
      return res.send({ message: 'user already exists' })
  }
  const result = await adminUserCollection.insertOne(user)
  res.send(result);
})
//


//users api
app.get('/users',async (req,res) =>{
    const result = await userCollection.find().toArray();
    res.send(result)
})

//user information crate and send api 
app.post('/users', async (req,res) => {
    const user = req.body;
    //Checked userCollection Email Present or Not
    const query = { email: user.email }
    const existingUser = await userCollection.findOne(query)
    if (existingUser) {
        return res.send({ message: 'user already exists' })
    }
    const result = await userCollection.insertOne(user)
    res.send(result);
})
//

//bus Newdata post
app.post('/bus',async (req,res)=>{
  const bus = req.body;
const result = await busInfoCollection.insertOne(bus)
res.send(result)
})
//
//And Bus Data Get
app.get('/businfo',async (req,res) =>{
  const result = await busInfoCollection.find().toArray();
  res.send(result)
})
//
//bus info Delete Api
app.delete('/businfo/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await busInfoCollection.deleteOne(query)
  res.send(result);
})
//



      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);
// mongodb 


app.get('/',(req,res)=>{
 res.send('ai bata')
});




app.listen(port,()=>{
    console.log(`Ami kisu pari na ${port}`)
})
