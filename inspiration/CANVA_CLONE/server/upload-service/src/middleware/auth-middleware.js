const authenticatedRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(401).json({
      error: "Access denied! Please login to continue",
    });
  }

  req.user = { userId };
  next();
};

module.exports = authenticatedRequest;
