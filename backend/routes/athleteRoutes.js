const express = require("express");
const router = express.Router();
const {
  getAthletes,
  getAthleteById,
  getAthleteByUserId,
  createAthlete,
  updateAthlete,
  getAthleteAcademic,
  getAthletePhysical,
  getAthleteMedical,
  getAthletePerformance,
  createPerformance,
  updatePerformance,
  deletePerformance,
} = require("../controllers/athleteController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
// Only athletes, coaches, and sport coordinators can access athlete management
router.use(authorize("athlete", "coach", "sport_coordinator"));

// Public endpoint - no auth required for getting athlete by user ID (for profile check)
router.get("/user/:userId", getAthleteByUserId);

// Get schedules
router.get("/", getAthletes);
router.get("/:id/performance", getAthletePerformance);
router.post("/:id/performance", authorize("coach", "sport_coordinator"), createPerformance);
router.put("/performance/:performanceId", authorize("coach", "sport_coordinator"), updatePerformance);
router.delete("/performance/:performanceId", authorize("coach", "sport_coordinator"), deletePerformance);
router.get("/:id/academic", getAthleteAcademic);
router.get("/:id/physical", getAthletePhysical);
router.get("/:id/medical", authorize("coach", "sport_coordinator"), getAthleteMedical);
router.get("/:id", getAthleteById);
router.get("/:id", getAthleteById);
// Create/Update: athletes can create/update their own, coach and sport_coordinator can manage all
router.post("/", authorize("athlete", "coach", "sport_coordinator"), createAthlete);
router.put("/:id", authorize("athlete", "coach", "sport_coordinator"), updateAthlete);

module.exports = router;
