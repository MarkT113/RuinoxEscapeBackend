const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const db = require("./database");

dotenv.config();

const app = express();

//app.use(express.json()); // Middleware to parse and receive JSON requests/bodies from the client

app.use(cors()); // Allow any/all domains to access API (Unity included)

app.use(bodyParser.json()); // Parse JSON requests (similar to 'express.json()')
app.use(bodyParser.urlencoded({extended: false}));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/gamedata", require("./routes/gameData"));
app.use("/api/leaderboard", require("./routes/leaderboard"));

app.get("/", (req, res) => {
  res.send("Ruinox Escape game API (SQLite) running!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server started on port ${PORT}");
});