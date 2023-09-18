const express = require("express");
const expressSession = require("express-session");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();

app.use(express.json());
// urlencoded
app.use(
  express.urlencoded({
    extended: true,
  }),
);
//cors
app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "accessToken",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
const { db } = require("./models"); // goes to 'models' folder and creates table based on JS files (except for 'index.js' file which is sequelize JS file)
// ---------------- END OF MIDDLEWARES
const UserLinkRoute = require("./routes/UserLinkRoute.js");
app.use("/auth", UserLinkRoute);
// ---------------- END OF ROUTES
db.sequelize.sync().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});
