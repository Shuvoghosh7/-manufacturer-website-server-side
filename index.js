const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port=process.env.PORT || 5000;
const app=express()

//meddle ware
app.use(cors());
app.use(express.json()) //use to get data req.body



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yr9id.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        await client.connect();
        const partsCollection = client.db('parts-manufacturer').collection('parts');
        const orderCollection= client.db('parts-manufacturer').collection('orders');

        console.log("Connect DB")
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
