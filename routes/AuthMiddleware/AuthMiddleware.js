const { verify } = require("jsonwebtoken");

const AuthMiddleware = (req, res, next) => {
  const accessToken = req.header("AccessToken");
  if (!accessToken) {
    return res.status(405).json({ error: "Log in to make changes" });
  } else {
    try {
      if (accessToken !== "null") {
        const validToken = verify(accessToken, "secret");
        req.user = validToken;
        if (validToken) {
          return next();
        }
      } else {
        return res.status(405).json({ error: "Log in to make changes" });
      }
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  }
  // verifies jsonwebtoken
};

module.exports = { AuthMiddleware };
