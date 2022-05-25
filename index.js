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
    return res.status(401).send({ message: "UnAuthorized access" });
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
    app.get("/blogs",async (req, res) => {
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
      const query = { _id: ObjectId(id)};
      const blogs = await blogsCollection.find(query).toArray();
      res.send({
        success: true,
        data: blogs,
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
