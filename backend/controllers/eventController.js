const Event = require("../model/event");

const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { teamId, type, sport, startDate, endDate } = req.query;

    const query = { isActive: true };
    if (teamId) query.teamId = teamId;
    if (type) query.type = type;
    if (sport) query.sport = sport;
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const events = await Event.find(query)
      .populate("teamId", "name sport")
      .populate("createdBy", "firstName lastName")
      .skip(skip)
      .limit(limit)
      .sort({ startTime: 1 });

    const total = await Event.countDocuments(query);

    res.json({
      events,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("teamId", "name sport")
      .populate("createdBy", "firstName lastName")
      .populate("attendees.userId", "firstName lastName email");
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id
    });
    await event.populate("teamId", "name sport");
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const allowedUpdates = [
      "title", "description", "type", "sport", "teamId", "location",
      "address", "startTime", "endTime", "isAllDay", "isRecurring",
      "recurrence", "notes", "isActive"
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.isActive = false;
    await event.save();
    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCalendar = async (req, res) => {
  try {
    const { start, end, teamId } = req.query;

    const query = { isActive: true };
    if (start && end) {
      query.startTime = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }
    if (teamId) query.teamId = teamId;

    const events = await Event.find(query)
      .populate("teamId", "name sport")
      .sort({ startTime: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const respondToEvent = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const attendeeIndex = event.attendees.findIndex(
      a => a.userId.toString() === req.user._id.toString()
    );

    if (attendeeIndex > -1) {
      event.attendees[attendeeIndex].status = status;
      event.attendees[attendeeIndex].responseTime = new Date();
    } else {
      event.attendees.push({
        userId: req.user._id,
        status,
        responseTime: new Date()
      });
    }

    await event.save();
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getEventAttendance = async (req, res) => {
  try {
    const Attendance = require("../model/attendance");
    const attendance = await Attendance.find({ eventId: req.params.id })
      .populate("athleteId")
      .populate("athleteId.userId", "firstName lastName email")
      .populate("userId", "firstName lastName email");
    
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getCalendar,
  respondToEvent,
  getEventAttendance,
};
