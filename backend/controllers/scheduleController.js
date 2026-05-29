const Schedule = require("../model/schedule");
const AthleteProfile = require("../model/athleteProfile");

const getSchedules = async (req, res) => {
  try {
    const { athleteId, dayOfWeek } = req.query;
    const query = {};

    // If user is athlete, only show their schedules
    if (req.user.role === 'athlete') {
      const athlete = await AthleteProfile.findOne({ userId: req.user._id });
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      query.athleteId = athlete._id;
    } else if (athleteId) {
      query.athleteId = athleteId;
    }

    if (dayOfWeek) {
      query.dayOfWeek = dayOfWeek;
    }

    const schedules = await Schedule.find(query)
      .populate("athleteId", "userId")
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json({ schedules });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate("athleteId", "userId");

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Check authorization: athletes can only access their own schedules
    if (req.user.role === 'athlete') {
      const athlete = await AthleteProfile.findOne({ userId: req.user._id });
      if (!athlete || schedule.athleteId._id.toString() !== athlete._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createSchedule = async (req, res) => {
  try {
    let athleteId = req.body.athleteId;

    // If athlete is creating, use their own profile
    if (req.user.role === 'athlete') {
      const athlete = await AthleteProfile.findOne({ userId: req.user._id });
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }
      athleteId = athlete._id;
      delete req.body.athleteId; // Remove any athleteId from body for athletes
    }

    // Validate required fields
    const { title, dayOfWeek, startTime, endTime } = req.body;
    if (!title || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ message: "Title, day, start time, and end time are required" });
    }

    const schedule = await Schedule.create({
      ...req.body,
      athleteId,
    });

    await schedule.populate("athleteId", "userId");
    res.status(201).json(schedule);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Check authorization
    if (req.user.role === 'athlete') {
      const athlete = await AthleteProfile.findOne({ userId: req.user._id });
      if (!athlete || schedule.athleteId.toString() !== athlete._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    const allowedUpdates = ["title", "type", "dayOfWeek", "startTime", "endTime", "location", "instructor", "notes", "color"];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        schedule[field] = req.body[field];
      }
    });

    await schedule.save();
    await schedule.populate("athleteId", "userId");
    res.json(schedule);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Check authorization
    if (req.user.role === 'athlete') {
      const athlete = await AthleteProfile.findOne({ userId: req.user._id });
      if (!athlete || schedule.athleteId.toString() !== athlete._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    await Schedule.deleteOne({ _id: req.params.id });
    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
