const Team = require("../model/team");
const Roster = require("../model/roster");
const User = require("../model/users");

const getTeams = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { sport, year, coachId } = req.query;

    const query = {};
    if (sport) query.sport = sport;
    if (year) query.year = year;
    if (coachId) query.coachId = coachId;

    // Filter by coach's assigned sports
    const user = req.user;
    if (user.role === 'coach' && user.sports && user.sports.length > 0) {
      query.sport = { $in: user.sports };
    }

    const teams = await Team.find(query)
      .populate("coachId", "firstName lastName email")
      .populate("sportCoordinatorId", "firstName lastName email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Team.countDocuments(query);

    res.json({
      teams,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("coachId", "firstName lastName email")
      .populate("sportCoordinatorId", "firstName lastName email")
      .populate("assistantCoaches", "firstName lastName email");
    
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createTeam = async (req, res) => {
  try {
    const team = await Team.create(req.body);
    await team.populate("coachId", "firstName lastName email");
    res.status(201).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const allowedUpdates = [
      "name", "sport", "season", "year", "sportCoordinatorId",
      "coachId", "assistantCoaches", "description", "logo", "colors", "isActive"
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        team[field] = req.body[field];
      }
    });

    await team.save();
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    team.isActive = false;
    await team.save();
    res.json({ message: "Team deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getTeamRoster = async (req, res) => {
  try {
    const roster = await Roster.find({ teamId: req.params.id })
      .populate("athleteId")
      .populate("athleteId.userId", "firstName lastName email avatar");
    
    res.json(roster);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const addToRoster = async (req, res) => {
  try {
    const { athleteId, position, jerseyNumber, notes } = req.body;
    const teamId = req.params.id;

    const existingEntry = await Roster.findOne({ teamId, athleteId });
    if (existingEntry) {
      return res.status(400).json({ message: "Athlete already on roster" });
    }

    const rosterEntry = await Roster.create({
      teamId,
      athleteId,
      position,
      jerseyNumber,
      notes,
      startDate: new Date()
    });

    await rosterEntry.populate("athleteId");
    res.status(201).json(rosterEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateRosterEntry = async (req, res) => {
  try {
    const rosterEntry = await Roster.findOne({
      teamId: req.params.id,
      athleteId: req.params.athleteId
    });

    if (!rosterEntry) {
      return res.status(404).json({ message: "Roster entry not found" });
    }

    const { position, jerseyNumber, status, notes } = req.body;
    if (position) rosterEntry.position = position;
    if (jerseyNumber) rosterEntry.jerseyNumber = jerseyNumber;
    if (status) rosterEntry.status = status;
    if (notes) rosterEntry.notes = notes;

    await rosterEntry.save();
    res.json(rosterEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const removeFromRoster = async (req, res) => {
  try {
    const rosterEntry = await Roster.findOneAndDelete({
      teamId: req.params.id,
      athleteId: req.params.athleteId
    });

    if (!rosterEntry) {
      return res.status(404).json({ message: "Roster entry not found" });
    }

    res.json({ message: "Athlete removed from roster" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamRoster,
  addToRoster,
  updateRosterEntry,
  removeFromRoster,
};
