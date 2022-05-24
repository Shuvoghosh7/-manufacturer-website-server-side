const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express()

//meddle ware
app.use(cors());
app.use(express.json()) //use to get data req.body



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yr9id.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJwt(req, res, next) {
  const authHader = req.headers.authorization
  if (!authHader) {
    return res.status(401).send({ message: 'Unauthorization' })
  }
  const token = authHader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const partsCollection = client.db('parts-manufacturer').collection('parts');
    const orderCollection = client.db('parts-manufacturer').collection('orders');
    const userCollection = client.db('parts-manufacturer').collection('users');

    console.log("Connect DB")
    // verifyAdmin function
    const verifyAdmin = async(req, res, next)=>{
      const requester = req.decoded.email;
          const requesterAccount = await userCollection.findOne({ email: requester });
          if (requesterAccount.role === 'admin') {
            next()
          }else{
            res.status(403).send({message: 'forbidden'});
          }
    }

    app.get('/get-parts', async (req, res) => {
      const result = await partsCollection.find({}).toArray()
      res.send(result)
    })

    app.get('/get-parts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const parts = await partsCollection.findOne(query);
      res.send(parts)
    });

    //perses order
    app.post('/add-orders', async (req, res) => {
      const data = req.body;
      const result = await orderCollection.insertOne(data)
      res.send(result)

    })
    //put users
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email
      const user = req.body
      const filter = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ result, token })
    })
    //get all user
    app.get('/user', verifyJwt, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });
    // make admin
    app.put('/user/admin/:email', verifyJwt,verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: 'admin' },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    })
    //check admin
    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === 'admin';
      res.send({ admin: isAdmin })
    })
   // my order
   app.get('/orders', async (req, res) => {
    const email = req.query.email
    const query = { email: email };
    const cursor = orderCollection.find(query);
    const result = await cursor.toArray();
    res.send(result)
  })
  // Delete orders
  app.delete('/orders/:id', async (req, res) => {
    const id = req.params.id
    const query = { _id: ObjectId(id) };
    const result = await orderCollection.deleteOne(query)
    res.send(result)
  })
  }
  finally {

  }

}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('running server parts')
})

//Listen Port
app.listen(port, () => {
  console.log('lising the port', port)
})
