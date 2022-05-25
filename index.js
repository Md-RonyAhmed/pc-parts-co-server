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
  await client.connect();
  const productCollection = client.db("pc-partsDb").collection("pc-parts");
  console.log('DB connected');
})().catch(console.dir);

app.get('/', (req, res) => {
  res.send("Welcome to PC parts Co. Manufacturers Ltd.");
})

app.listen(port, () => {
  console.log(`PC parts co. server running on port: ${port}`);
});