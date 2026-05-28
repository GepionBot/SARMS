const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    athleteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AthleteProfile",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["class", "study", "practice", "meeting", "other"],
      default: "class",
    },
    dayOfWeek: {
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      required: [true, "Day is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    location: {
      type: String,
      trim: true,
    },
    instructor: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
  },
  {
    timestamps: true,
  }
);

scheduleSchema.index({ athleteId: 1 });
scheduleSchema.index({ dayOfWeek: 1 });

const Schedule = mongoose.model("Schedule", scheduleSchema);

module.exports = Schedule;
