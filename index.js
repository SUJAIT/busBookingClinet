const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const stripe = require('stripe')('sk_test_51L27WdEDv8zcGvWbAQp2KHPYrspzm0l0AfRWxtKTday7OXyEiOqWIyGOUZlwQxaNPoymmaGylYOSpEj6KJlettO800mvUniqbf')

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

//

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
//
app.get('/businfo/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id:new ObjectId(id)};
  const result = await busInfoCollection.findOne(query);
  res.send(result)
})

//bus info Delete Api
app.delete('/businfo/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await busInfoCollection.deleteOne(query)
  res.send(result);
})
//




//search

// app.post('/search', async (req, res) => {
//   const { from, to, busType, departureDate } = req.body;

//   const query = {};
//   if (from) query.from = from;
//   if (to) query.to = to;
//   if (busType) query.busType = busType;
//   if (departureDate) {
//     const startOfDay = new Date(departureDate).setHours(0, 0, 0, 0);
//     const endOfDay = new Date(departureDate).setHours(23, 59, 59, 999);
//     query.departureDate = { $gte: new Date(startOfDay), $lte: new Date(endOfDay) };
//   }

//   try {
//     const results = await bus.find(query);
//     res.json(results);
//   } catch (error) {
//     res.status(500).send('Error retrieving data');
//   }
// });
app.post('/search', async (req, res) => {
  const { from, to, busType, departureDate } = req.body;

  // Build the query dynamically
  const query = {};
  if (from) query.from = new RegExp(from, 'i'); // Case-insensitive search
  if (to) query.to = new RegExp(to, 'i');
  if (busType && busType !== 'ALL') query.busType = busType;
  if (departureDate) {
    const startOfDay = new Date(departureDate).setHours(0, 0, 0, 0);
    const endOfDay = new Date(departureDate).setHours(23, 59, 59, 999);
    query.departureDate = { $gte: new Date(startOfDay), $lte: new Date(endOfDay) };
  }

  try {
    const results = await busInfoCollection.find(query).toArray();
    res.send(results);
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving search results', error });
  }
});


///
//payment intent
// app.post('/create-payment-intent', async (req, res)=>{
//   const {price} = req.body;
//   const amount = parseInt(price * 1000);
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: amount,
//     currency: 'usd',
//     payment_method_types: ['card']
//   });
//   res.send({
//     clientSecret: paymentIntent.client_secret
//   })
// })

//payment api

// app.post('/create-checkout-session', async (req, res)=>{
// const product = req.body;
 
// console.log(product)
// // const session = await stripe.checkout.sessions.create({
// //   payment_method_types:["card"],
// //   line_items:,
// //   mode:"payment",
// //   success_url:"http://localhost:3000/success",
// //   cancel_url:"http://localhost:3000/cancel"
// // })

// })

app.post('/create-checkout-session', async (req, res) => {
  const {products} = req.body;
  
console.log(products)
 
    const lineItems = products.map((product) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${product.destinationFrom} to ${product.destinationTo} (${product.seatType})`,
        },
        unit_amount: product.totalPrice * 100, // Convert to cents
      },
      quantity: 1, // Assuming 1 quantity per product
    }));

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:5173/success`,
      cancel_url: `http://localhost:5173/cancel`,
    });

res.json({id: session.id})
  
});


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
