const db = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SALT_ROUNDS = 10;

const generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};


const signupUser = async (req, res) => {
  const {username, password} = req.body;

  if (!username || !password) {
    return res.status(400).json({message: "Please provide username and password"});
  }
  if (password.length < 6) {
      return res.status(400).json({message: "Password must be at least 6 characters long"});
  }
  const lowerCaseUsername = username.toLowerCase();

  const checkSql = `SELECT id FROM users WHERE username = ? COLLATE NOCASE`;
  db.get(checkSql, [lowerCaseUsername], async (err, row) => {
    if (err) {
      console.error("Signup check error:", err.message);
      return res.status(500).json({message: "Server error during registration check"});
    }
    if (row) {
      return res.status(400).json({message: "Username already exists"});
    }

    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const insertUserSql = `INSERT INTO users (username, hashed_password) VALUES (?, ?)`;
      db.run(insertUserSql, [lowerCaseUsername, hashedPassword], function (err) {
        if (err) {
          console.error("Signup insert user error:", err.message);
          return res.status(500).json({message: "Server error during user creation"});
        }

        const newUserId = this.lastID;

        const insertGameDataSql = `INSERT INTO game_data (user_id) VALUES (?)`;
        db.run(insertGameDataSql, [newUserId], (err) => {
          if (err) {
            console.error("Signup insert gamedata error:", err.message);
            return res.status(500).json({message: "Server error creating initial game data"});
          }

          res.status(201).json({
            id: newUserId,
            username: lowerCaseUsername,
            token: generateToken(newUserId),
            message: "User registered successfully"
          });
        });
      });
    } catch (hashError) {
      console.error("Password hashing error:", hashError);
      res.status(500).json({message: "Server error during password processing"});
    }
  });
};


const loginUser = async (req, res) => {
  const {username, password} = req.body;

  if (!username || !password) {
    return res.status(400).json({message: "Please provide username and password"});
  }
  const lowerCaseUsername = username.toLowerCase();

  const sql = `SELECT id, username, hashed_password FROM users WHERE username = ? COLLATE NOCASE`;
  db.get(sql, [lowerCaseUsername], async (err, user) => {
    if (err) {
      console.error("Login DB error:", err.message);
      return res.status(500).json({message: "Server error during login"});
    }

    if (!user) {
      return res.status(401).json({message: "Invalid credentials"});
    }

    try {
      const isMatch = await bcrypt.compare(password, user.hashed_password);

      if (isMatch) {
        res.json({
          id: user.id,
          username: user.username,
          token: generateToken(user.id),
          message: "Login successful"
        });
      } else {
        res.status(401).json({message: "Invalid credentials"});
      }
    } catch (compareError) {
      console.error("Password comparison error:", compareError);
      res.status(500).json({message: "Server error during authentication process"});
    }
  });
};


module.exports = {
  signupUser,
  loginUser,
};