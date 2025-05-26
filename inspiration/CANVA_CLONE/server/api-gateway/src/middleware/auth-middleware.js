const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Access denied! No Token provided",
    });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    //add user info to req.user
    req.user = {
      userId: payload["sub"],
      email: payload["email"],
      name: payload["name"],
    };

    //Add User ID to headers for downstream services
    req.headers["x-user-id"] = payload["sub"];

    //optional
    req.headers["x-user-email"] = payload["email"];
    req.headers["x-user-name"] = payload["name"];

    next();
  } catch (err) {
    console.error("Token verification failed", err);
    res.status(401).json({
      error: "Invalid Token!",
    });
  }
}

module.exports = authMiddleware;
