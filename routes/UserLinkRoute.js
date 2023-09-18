const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
// enviromental variables
require("dotenv").config({ path: "../.env" });
// database: Users table
const { db } = require("../models"); // database
const Users = db.Users; // Users model from database
const Counts = db.Counts; // Counts model from database
// jwb token validation middleware
const { AuthMiddleware } = require("./AuthMiddleware/AuthMiddleware");
const { sign } = require("jsonwebtoken");
// fetching of data related imports
const fetch = require("isomorphic-fetch");

// handles registration route
router.post("/register", async (req, res) => {
  try {
    // hash password of user
    const hash = await bcrypt.hash(req.body.password, 10);
    // Create a new user in the "Users" table
    const UserRegistrationToDatabase = await Users.create({
      username: req.body.username,
      password: hash,
    });
    console.log(UserRegistrationToDatabase.id);
    // sending to Counts table user id of Users table
    const AssociateUserWithCountsTable = await Counts.create({
      userId: UserRegistrationToDatabase.id,
    });
    // handle registration error in database
    if (!UserRegistrationToDatabase || !AssociateUserWithCountsTable) {
      return res.status(500).json({ message: "could not register user" });
    }
    // send success status to fron-end
    return res.status(200).json({
      message: `successfully registred username: ${req.body.username}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "could not register user" });
  }
});
// checks username before proceeding to confirmation page
router.post("/register/checkUserInfo", async (req, res, next) => {
  try {
    const IsUsernameInDatabaseAlready = await Users.findOne({
      where: { username: req.body.username },
    });
    if (IsUsernameInDatabaseAlready) {
      // send to front-end conflict status: username already exists
      return res.status(409).json({
        message:
          "The provided username is already in use. Please choose a different username.",
      });
    }
    // send to front-end username is does not exist
    return res
      .status(200)
      .json({ message: `username: ${req.body.username} is registrable` });
  } catch (error) {
    return res.status(409).json(
      json({
        message: error,
      }),
    );
  }
});
// handles login route
router.post("/login", async (req, res) => {
  try {
    // find username
    const CheckLoginCredentials = await Users.findOne({
      where: { username: req.body.username },
      include: [Counts],
    });
    //unhash password
    bcrypt
      .compare(req.body.password, CheckLoginCredentials.password)
      .then((match) => {
        // send error message in case of wrong credentials
        if (!match) {
          return res
            .status(401)
            .json({ message: "invalid username or password" });
        }
        const AccessToken = sign(
          {
            username: CheckLoginCredentials.username,
            id: CheckLoginCredentials.id,
          },
          process.env.SESSION_SECRET, //session secret
        );
        //send success response
        return res.status(200).json({
          success: `Logged In!!! Welcome back ${req.body.username} We missed You :)`,
          AccessToken: AccessToken,
          username: CheckLoginCredentials.username,
          id: CheckLoginCredentials.id,
        });
      });
  } catch (error) {
    return res.status(409).json(
      json({
        message: error,
      }),
    );
  }
});
// Clarifai API
router.post("/clarifai", async (req, res) => {
  // API related configuration DO NOT CHANGE
  const raw = JSON.stringify({
    user_app_id: {
      user_id: process.env.USER_ID,
      app_id: process.env.APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: req.body.imageUrl,
          },
        },
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Key " + process.env.PAT,
    },
    body: raw,
  };

  const SendRequestToClarifaiWebsite = await fetch(
    "https://api.clarifai.com/v2/models/" +
      process.env.MODEL_ID +
      "/versions/" +
      process.env.MODEL_VERSION_ID +
      "/outputs",
    requestOptions,
  );
  // END OF API CONFIGURATIONS
  if (SendRequestToClarifaiWebsite.ok) {
    const data = await SendRequestToClarifaiWebsite.json();
    // Check if the response data contains a bounding box
    if (
      !data.outputs &&
      !data.outputs[0].data.regions[0].region_info.bounding_box
    ) {
      return res
        .status(404)
        .json({ message: "coordinates have not beein identified" });
    }
    // Set the state with the bounding box coordinates
    const bounding_box =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    return res.status(200).json(bounding_box);
  }
});
// validate Token
router.get("/validToken", AuthMiddleware, async (req, res) => {
  const UserData = await Users.findOne({
    where: { username: req.user.username },
    attributes: { exclude: ["password", "createdAt", "updatedAt"] },
  });
  if (isAdmin.isAdmin) {
    res.status(200).json(UserData);
  } else {
    res.status(200).json(req.user);
  }
  //res.json(req.user);
});

module.exports = router;
