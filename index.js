// SERVER

// importing required dependencies
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const mongoose = require("mongoose");
const validator = require("validator");
const fs = require("fs");
const { log } = require("console");

const jwtsecret = process.env.JWT_SECRET;
const app = express();
const PORT = process.env.PORT || 5500;
/************************************************************************************** */

// FAVICON
// app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

/************************************************************************************** */

// connect to mongoDb
const connectDb = async function () {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      /*  it enables and ensures that the application uses the latest URL parser,
        In previous versions of MongoDB's Node.js driver, there was an older URL parser used by default. However, the older parser has been deprecated, and the new URL parser is recommended for parsing MongoDB connection strings (URLs).*/
      useNewUrlParser: true,

      /* It enables the latest server discovery and monitoring in MongoDB. It ensures a stable connection to MongoDB clusters, offering reliability and improved performance.*/
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

/* This code connects to the MongoDB database and, once the connection is successful, starts the Express.js server to handle incoming web requests. It ensures that the server waits for the database to be ready before serving requests. */
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });
});
/************************************************************************************** */

// mongoDB data model(schema) , templates
const Post = mongoose.model(
  "Post",
  new mongoose.Schema({
    title: String,
    content: String,
    imageUrl: String,
    author: String,
    timestamp: String,
  })
);

// below method is doing exactly same as above

// const postSchema = new mongoose.Schema({
//   title: {
//     type: String,
//   },
//   content: {
//     type: String,
//   },
//   imageUrl: {
//     type: String,
//   },
//   author: {
//     type: String,
//   },
//   timestamp: {
//     String,
//   },
// });
// const Post = mongoose.model("Post", postSchema);

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    password: String,
    role: String,
  })
);
/************************************************************************************** */

// middlewares

// requests from any origin (* means all origins) to access resources on your server
app.use(cors({ origin: "*" }));

// handle JSON data sent from client applications, such as in the request body of an HTTP POST or PUT request.
app.use(bodyParser.json());

// serving static files from the current directory since path is not specified
app.use(express.static(path.join(__dirname)));

// a route handler for HTTP GET requests to the root path ("/").
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
/************************************************************************************** */