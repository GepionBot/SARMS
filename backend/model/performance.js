const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    athleteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AthleteProfile",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    statistics: {
      minutesPlayed: Number,
      gamesStarted: Number,
      gamesPlayed: Number,
      customMetrics: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
    },
    achievements: [
      {
        title: String,
        description: String,
        date: Date,
        type: {
          type: String,
          enum: ["award", "record", "milestone", "recognition"],
        },
        awardedBy: String,
        documentUrl: String,
      },
    ],
    progress: [
      {
        category: String,
        metric: String,
        value: Number,
        previousValue: Number,
        change: Number,
        date: Date,
        notes: String,
      },
    ],
    notes: {
      type: String,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

performanceSchema.index({ athleteId: 1 });
performanceSchema.index({ teamId: 1 });
performanceSchema.index({ eventId: 1 });
performanceSchema.index({ createdAt: 1 });

const Performance = mongoose.model("Performance", performanceSchema);

module.exports = Performance;
