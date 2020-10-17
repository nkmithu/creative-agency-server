const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;


app.use(cors());
app.use(bodyParser.json());
app.use(express.static('services'));
app.use(fileUpload());

const port = 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gaxfg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
client.connect(err => {
    const services = client.db("creative-agency").collection("services");
    const reviews = client.db("creative-agency").collection("reviews");
    const orders = client.db("creative-agency").collection("orders");
    const admin = client.db("creative-agency").collection("admin");
    // perform actions on the collection object
    console.log('db connected');

    app.post('/addAService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        console.log(title, description, file);
        file.mv(`${__dirname}/services/${file.name}`, err=>{
            if(err){
                console.log(err);
                return res.status(500).send({msg: 'Failed To Upload Image'})
            }
            return res.send({msg: "File Uploaded Successfully"})
        })

        services.insertOne({title, description, img:file.name})
    });

    app.get('/services', (req, res) => {
        services.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/addReview', (req, res) => {
        const newReview = req.body;
        reviews.insertOne(newReview)
            .then(result => {
                res.send(result.insertedCount > 0)
                console.log(result);
            })
    });
    
    app.get('/reviews', (req, res) => {
        reviews.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        orders.insertOne(newOrder)
            .then(result => {
                res.send(result.insertedCount > 0)
                console.log(result);
            })
    });

    app.get('/orders', (req, res) => {
        const loggedInEmail = req.query.email;
        orders.find({email:loggedInEmail})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
    
    app.post('/addAdmin', (req, res) => {
        const newAdmin = req.body;
        admin.insertOne(newAdmin)
            .then(result => {
                res.send(result.insertedCount > 0)
                console.log(result);
            })
    });

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        admin.find({ email: email })
            .toArray((err, admin) => {
                res.send(admin.length > 0);
            })
    })
    
});


app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(port)