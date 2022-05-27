const express = require("express");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}


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
    const userCollection = client.db("partsDb").collection("users");
    const partsCollection = client.db("partsDb").collection("parts");
    const ordersCollection = client.db("partsDb").collection("orders");
    console.log("DB connected");

    // post data to DB
    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      await blogsCollection.insertOne(blog);
      res.send({
        success: true,
        message: `Successfully inserted ${blog.name}`,
      });
    });
    //get all blog
    app.get("/blogs", async (req, res) => {
      const query = {};
      const blogs = await blogsCollection.find(query).toArray();
      if (!blogs?.length) {
        return res.send({ success: false, error: "No blog found" });
      }
      res.send({
        success: true,
        data: blogs,
      });
    });
    // get single blog
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const blogs = await blogsCollection.find(query).toArray();
      res.send({
        success: true,
        data: blogs,
      });
    });

    //get users
    app.get("/user", verifyJWT, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "6h" }
      );
      res.send({ result, token });
    });

    //post parts
    app.post("/parts", async (req, res) => {
      const parts = req.body;
      await partsCollection.insertOne(parts);
      res.send({
        success: true,
        message: `Successfully inserted`,
      });
    });

    //get limited parts
    app.get("/parts", async (req, res) => {
      const limit = Number(req.query.limit);
      const parts = await partsCollection
        .find()
        .sort({ $natural: -1 })
        .limit(limit)
        .toArray();
      if (!parts?.length) {
        return res.send({ success: false, error: "No parts found" });
      }
      res.send({
        success: true,
        data: parts,
      });
    });
    //get all parts
    app.get("/parts", async (req, res) => {
      const query = {};
      const parts = await await partsCollection.find(query).toArray();
      if (!parts?.length) {
        return res.send({ success: false, error: "No parts found" });
      }
      res.send({
        success: true,
        data: parts,
      });
    });

    //get parts with id
    app.get("/parts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id)};
      const cursor = partsCollection.find(query);
      const parts = await cursor.toArray();
      // res.send(result);
      res.send({
        success: true,
        data: parts,
      });
    });

    //post place orders
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      await ordersCollection.insertOne(orders);
      res.send({
        success: true,
        message: `Successfully Place Order`,
      });
    });

  } catch (error) {
    console.log(error);
  }
})().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to PC parts Co. Manufacturers Ltd.");
});

app.listen(port, () => {
  console.log(`PC parts co. server running on port: ${port}`);
});
