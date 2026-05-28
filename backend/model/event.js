const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["practice", "game", "tournament", "meeting", "other"],
      default: "practice",
    },
    sport: {
      type: String,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    location: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "biweekly", "monthly"],
      },
      interval: Number,
      endDate: Date,
      daysOfWeek: [Number],
    },
    attendees: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined", "tentative"],
          default: "pending",
        },
        responseTime: Date,
      },
    ],
    reminders: [
      {
        type: {
          type: String,
          enum: ["email", "in-app"],
        },
        timeBefore: Number,
        sent: {
          type: Boolean,
          default: false,
        },
      },
    ],
    notes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ teamId: 1 });
eventSchema.index({ startTime: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ sport: 1 });

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
