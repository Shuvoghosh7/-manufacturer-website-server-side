const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const port=process.env.PORT || 5000;
const app=express()

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

async function run(){
    try{
        await client.connect();
        const partsCollection = client.db('parts-manufacturer').collection('parts');
        const orderCollection= client.db('parts-manufacturer').collection('orders');
        const userCollection= client.db('parts-manufacturer').collection('users');

        console.log("Connect DB")
        app.get('/get-parts', async (req, res) => {
            const result = await partsCollection.find({}).toArray()
            res.send(result)
        })

        app.get('/get-parts/:id',verifyJwt, async (req, res) => {
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
            const  token = jwt.sign({ email:email },  process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h' });
            res.send({ result,token})
          })


    }
    finally{

    }

}
run().catch(console.dir)
 
app.get('/',(req,res)=>{
    res.send('running server parts')
})

//Listen Port
app.listen(port,()=>{
    console.log('lising the port',port)
})
