const jwt = require("jsonwebtoken");
const db = require("../database"); // Import SQLite db connection
require("dotenv").config();

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

      const sql = `SELECT id, username, created_at FROM users WHERE id = ?`;
      db.get(sql, [decoded.id], (err, user) => {
        if (err) {
          console.error("Auth middleware DB error:", err.message);
          return res.status(500).json({message: "Server error during authentication"});
        }
        if (!user) {
          return res.status(401).json({message: "Not authorised, user not found"});
        }

        req.user = user;
        next(); // Proceed to the protected route
      });

    } catch (error) {
      console.error("Token verification failed:", error);
       if (error.name === "JsonWebTokenError") {
           return res.status(401).json({message: "Not authorised, token failed"});
       }
       if (error.name === "TokenExpiredError") {
           return res.status(401).json({message: "Not authorised, token expired"});
       }
       return res.status(401).json({message: "Not authorised, invalid token"});
    }
  }

  if (!token) {
    res.status(401).json({message: "Not authorised, no token provided"});
  }
};

module.exports = {protect};