const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        console.log("Connect DB")
        app.get('/get-parts', async (req, res) => {
            
            const services = await partsCollection.find({}).toArray()
            res.send(services)
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
