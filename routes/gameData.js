const express = require("express");
const router = express.Router();
const {getGameData, updateGameData, resetGameData} = require("../controllers/gameDataController");
const {protect} = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getGameData);

router.put("/", updateGameData);

router.put("/reset", resetGameData);

module.exports = router;