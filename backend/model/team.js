const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    sport: {
      type: String,
      required: [true, "Sport is required"],
    },
    season: {
      type: String,
    },
    year: {
      type: Number,
    },
    sportCoordinatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Coach is required"],
    },
    assistantCoaches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    colors: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

teamSchema.index({ sport: 1 });
teamSchema.index({ coachId: 1 });
teamSchema.index({ sportCoordinatorId: 1 });
teamSchema.index({ name: 1, sport: 1, year: 1 }, { unique: true });

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
