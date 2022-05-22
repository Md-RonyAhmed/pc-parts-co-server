const express = require('express');
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

(async () => {
  
})().catch(console.dir);

app.get('/', (req, res) => {
  res.send("Welcome to PC parts Co. Manufacturers Ltd.");
})

app.listen(port, () => {
  console.log(`PC parts co. server running on port: ${port}`);
});