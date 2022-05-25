const express = require('express');
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

const corsConfig = {
  origin: true,
  credentials: true,
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

app.use(express.json());

// DB connection
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.ntftt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

(async () => {
  try {
    await client.connect();
    const blogsCollection = client.db("partsDb").collection("blogs");
    console.log("DB connected");

    // post data to DB
    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      await blogsCollection.insertOne(blog);
      res.send({
        success: true,
        message: `Successfully inserted`,
      });
    });
  } catch (error) {
    
    console.log(error);
    
  }
})().catch(console.dir);

app.get('/', (req, res) => {
  res.send("Welcome to PC parts Co. Manufacturers Ltd.");
})

app.listen(port, () => {
  console.log(`PC parts co. server running on port: ${port}`);
});