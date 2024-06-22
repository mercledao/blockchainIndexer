const skipAllAuth = new Set(["GET:", "GET:/ping", "GET:/test"]);

module.exports = async (req, res, next) => {
  try {
    if (req.method.toUpperCase() == "OPTIONS" || req.method.toUpperCase() == "HEAD") return next();

    const reqPath = req.path.endsWith("/") ? req.path.slice(0, -1) : req.path;
    if (skipAllAuth.has(`${req.method.toUpperCase()}:${reqPath}`)) {
      return next();
    }

    const token = req.headers["auth"];
    if (token !== process.env.INDEXER_ACCESS_KEY) {
      throw new Error("auth middleware failed");
    }
    return next();
  } catch (e) {
    console.error(e);
  }
  console.error("auth middleware failed");
  return res.sendStatus(401);
};
