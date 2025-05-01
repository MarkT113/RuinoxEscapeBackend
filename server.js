const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./database");

dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json());
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