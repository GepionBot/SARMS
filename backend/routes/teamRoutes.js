const express = require("express");
const router = express.Router();
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamRoster,
  addToRoster,
  updateRosterEntry,
  removeFromRoster,
} = require("../controllers/teamController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getTeams);
router.get("/:id", getTeamById);
router.post("/", authorize("sport_coordinator", "coach"), createTeam);
router.put("/:id", authorize("sport_coordinator", "coach"), updateTeam);
router.delete("/:id", authorize("sport_coordinator"), deleteTeam);
router.get("/:id/roster", getTeamRoster);
router.post("/:id/roster", authorize("sport_coordinator", "coach"), addToRoster);
router.put("/:id/roster/:athleteId", authorize("sport_coordinator", "coach"), updateRosterEntry);
router.delete("/:id/roster/:athleteId", authorize("sport_coordinator", "coach"), removeFromRoster);

module.exports = router;
