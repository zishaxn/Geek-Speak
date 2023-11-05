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

// JWT Authentication middleware

/*  When you log in, a JWT token is created and provided to you as part of the authentication process. This token is then used to validate and authorize subsequent requests and responses during your session. */

const authenticateJWT = (req, res, next) => {
  /* In the following code it takes header from the clinet request and extracts the actual token(a token has three part header, payload and a signature) actualy token only contains header(a key as string), and payload(user informaton) */
  const token = req.headers.authorization.split(" ")[1];

  // Here it will check the token is there or not if its there then it will verify it with the jwtsecret ,jwtSecret is a confidential key securely stored on the server. It's used to sign and verify JWT tokens, ensuring their authenticity and security. if verified then it will attached the user info to the req object, and pass the control to next middleware.
  if (token) {
    jwt.verify(token, jwtsecret, (err, user) => {
      if (err) {
        console.log("JWT Verification Error", err.message);
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    console.log("Token is Missing");
    res.sendStatus(401);
  }
};
/************************************************************************************** */

// user registration
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  // sanitize and validate user input
  // Following code works by in cases where user data might get executed as code like (e.g., <, >, &) so it converts them to their equivalent safe representations (e.g., &lt;, &gt;, &amp;). This helps prevent potential cross-site scripting (XSS), and sql injection.

  const santizedUsername = validator.escape(username);
  const santizedPassword = validator.escape(password);

  // Ensure valid input data and not missing
  if (!santizedUsername || !santizedPassword) {
    return res.status(400).send({ error: "Invalid Input Data" });
  }

  // Following code will convert our password into a hashed password and , 10 is a cost factor meaning how many times it will alter the hashing to get the final conversion of our password.
  const hashedPassword = await bcrypt.hash(santizedPassword, 10);

  // here it creates a new user(instance) from the db model.
  const newUser = new User({
    username: santizedPassword,
    password: santizedPassword,
    role,
  });

  // save method is provided by the mongoose ODM
  await newUser.save();
  res.send(200).send({ success: true });
});
/************************************************************************************** */

// user login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // sanitize and validate user input
  const santizedUsername = validator.escape(username);
  const santizedPassword = validator.escape(password);

  // Ensure valid input data
  if (!santizedUsername || !santizedPassword) {
    return res.status(400).send({ error: "Invalid Input Data" });
  }

  // it find the user with the given username
  const user = await User.findOne({ username: santizedUsername });

  // folloing code validates the user
  if (user) {
    //   compares enterd password and password in db
    if (bcrypt.compare(password, user.password)) {
      /*it is creating a token using the jwt method which first consist the header which contains info about token type algorithm that used,and we will append it with the username and role then we have will append it with jwt_secret key, and it will be expired in 24 hours after that a new token needs to be generated*/
      const accesToken = jwt.sign(
        {
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      res
        .status(200)
        .send({ success: true, token: accesToken, role: user.role });
    } else {
      res.status(401).send({ success: false });
    }
  }
});
