const express = require("express");
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getCalendar,
  respondToEvent,
  getEventAttendance,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getEvents);
router.get("/calendar", getCalendar);
router.get("/:id", getEventById);
router.post("/", authorize("sport_coordinator", "coach"), createEvent);
router.put("/:id", authorize("sport_coordinator", "coach"), updateEvent);
router.delete("/:id", authorize("sport_coordinator", "coach"), deleteEvent);
router.post("/:id/attend", respondToEvent);
router.get("/:id/attendance", authorize("sport_coordinator", "coach"), getEventAttendance);

module.exports = router;
