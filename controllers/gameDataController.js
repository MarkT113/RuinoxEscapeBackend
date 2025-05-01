const db = require("../database");

const getGameData = (req, res) => {
  const userId = req.user.id;

  const sql = `SELECT * FROM game_data WHERE user_id = ?`;

  db.get(sql, [userId], (err, row) => {
    if (err) {
      console.error("Get GameData DB error:", err.message);
      return res.status(500).json({message: "Server error retrieving game data."});
    }
    if (!row) {
      console.warn("No game_data found for user_id: ${userId}");
      return res.status(404).json({message: "Game data not found for this user."});
      /* This is an unlikely case but it is still best to account for / handle it
      return res.json({
          user_id: userId, has_active_game: 0, current_scene_index: 1,
          player_position_x: 0, player_position_y: 0, current_timer: 0,
          current_oxygen_level: 100, minigames_status: "[0,0,0]", dash_charges: 0,
          difficulty_level: 1, best_time: null, high_score: 0
      });*/
    }

    try {
        if (row.minigames_status) {
            row.minigames_status_array = JSON.parse(row.minigames_status);
        } else {
            row.minigames_status_array = [0, 0, 0];
        }
    } catch (parseError) {
        console.error("Error parsing minigames_status JSON:", parseError);
        row.minigames_status_array = [0, 0, 0];
    }

    res.json(row);
  });
};


const updateGameData = (req, res) => {
  const userId = req.user.id;

  const {
    has_active_game,
    current_scene_index,
    player_position_x,
    player_position_y,
    current_timer,
    current_oxygen_level,
    minigames_status_array,
    dash_charges,
    difficulty_level,
    is_win_condition,
    final_time
  } = req.body;

  if (has_active_game === undefined || current_scene_index === undefined || minigames_status_array === undefined) {
      return res.status(400).json({message: "Missing required game data fields."});
  }
  const hasActiveGameInt = has_active_game ? 1 : 0;
  const minigamesStatusString = JSON.stringify(minigames_status_array);
  let newBestTime = null;
  let newHighScore = 0;

  const getSql = `SELECT best_time, high_score FROM game_data WHERE user_id = ?`;
  db.get(getSql, [userId], async (err, currentRow) => {
      if (err) {
          console.error("Update GameData (get current) DB error:", err.message);
          return res.status(500).json({message: "Server error preparing to update game data."});
      }
      if (!currentRow) {
          return res.status(404).json({message: "Cannot update game data: user record not found."});
      }

      newBestTime = currentRow.best_time;
      newHighScore = currentRow.high_score;

      if (is_win_condition && final_time !== undefined) {
          if (newBestTime === null || final_time < newBestTime) {
              newBestTime = final_time;
              newHighScore = Math.floor(newBestTime > 0 ? newBestTime : 0) * 5;
              console.log("New record for user ${userId}! Time: ${newBestTime}, Score: ${newHighScore}");
          }
      }

      const updateSql = `
          UPDATE game_data SET
              has_active_game = ?,
              current_scene_index = ?,
              player_position_x = ?,
              player_position_y = ?,
              current_timer = ?,
              current_oxygen_level = ?,
              minigames_status = ?,
              dash_charges = ?,
              difficulty_level = ?,
              best_time = ?,
              high_score = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
      `;

      const params = [
          hasActiveGameInt,
          current_scene_index,
          player_position_x,
          player_position_y,
          current_timer,
          current_oxygen_level,
          minigamesStatusString,
          dash_charges,
          difficulty_level,
          newBestTime,
          newHighScore,
          userId
      ];

      db.run(updateSql, params, function (err) {
          if (err) {
              console.error("Update GameData DB error:", err.message);
              return res.status(500).json({message: "Server error saving game data."});
          }
          if (this.changes === 0) {
              return res.status(404).json({message: "Game data not found for this user, update failed."});
          }
          res.json({message: "Game data saved successfully."});
      });
  });
};


const resetGameData = (req, res) => {
  const userId = req.user.id;

  const sql = `
    UPDATE game_data SET
        has_active_game = 0,
        current_scene_index = 1,
        player_position_x = 0,
        player_position_y = 0,
        current_timer = 0,
        current_oxygen_level = 100,
        minigames_status = "[0,0,0]",
        dash_charges = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `;

  db.run(sql, [userId], function (err) {
    if (err) {
      console.error("Reset GameData DB error:", err.message);
      return res.status(500).json({message: "Server error resetting game data."});
    }
    if (this.changes === 0) {
      return res.status(404).json({message: "Game data not found for this user, reset failed."});
    }
    res.json({message: "Active game state reset successfully."});
  });
};


module.exports = {
  getGameData,
  updateGameData,
  resetGameData,
};