const mongoose = require("mongoose");

const rosterSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    athleteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AthleteProfile",
      required: true,
    },
    position: {
      type: String,
    },
    jerseyNumber: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "transfer", "graduated"],
      default: "active",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

rosterSchema.index({ teamId: 1 });
rosterSchema.index({ athleteId: 1 });
rosterSchema.index({ teamId: 1, athleteId: 1 }, { unique: true });

const Roster = mongoose.model("Roster", rosterSchema);

module.exports = Roster;
