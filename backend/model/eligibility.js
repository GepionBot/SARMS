const mongoose = require("mongoose");

const eligibilitySchema = new mongoose.Schema(
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
    eligibility: {
      status: {
        type: String,
        enum: ["eligible", "ineligible", "pending"],
        default: "pending",
      },
      gpaRequirement: {
        type: Number,
        default: 2.0,
      },
      creditsRequirement: {
        type: Number,
        default: 12,
      },
      currentGpa: Number,
      currentCredits: Number,
      lastChecked: Date,
      notes: String,
    },
    alerts: [
      {
        type: {
          type: String,
          enum: ["low-gpa", "low-credits", "course-failed", "probation"],
        },
        message: String,
        severity: {
          type: String,
          enum: ["warning", "critical"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        acknowledged: {
          type: Boolean,
          default: false,
        },
        acknowledgedAt: Date,
      },
    ],
    history: [
      {
        semester: String,
        gpa: Number,
        credits: Number,
        status: String,
        checkedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

eligibilitySchema.index({ athleteId: 1 });
eligibilitySchema.index({ "eligibility.status": 1 });

const Eligibility = mongoose.model("Eligibility", eligibilitySchema);

module.exports = Eligibility;
