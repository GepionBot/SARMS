const mongoose = require("mongoose");

const athleteProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String,
    },
     academic: {
       studentId: {
         type: String,
         unique: true,
       },
       major: String,
       minor: String,
       year: {
         type: Number,
         min: 1,
         max: 4,
       },
       gpa: {
         type: Number,
         min: 0,
         max: 4.0,
       },
       creditsCompleted: {
         type: Number,
         default: 0,
       },
       totalCredits: {
         type: Number,
         default: 120,
       },
       adviser: {
         name: String,
         email: String,
         phone: String,
         department: String,
       },
       courses: [
        {
          code: String,
          name: String,
          credits: Number,
          grade: String,
          semester: String,
          status: {
            type: String,
            enum: ["completed", "in-progress", "planned"],
          },
        },
      ],
    },
    physical: {
      height: Number,
      weight: Number,
      bodyFat: Number,
      wingspan: Number,
      verticalJump: Number,
      lastUpdated: Date,
    },
    medical: {
      bloodType: String,
      allergies: [String],
      medications: [String],
      injuries: [
        {
          type: String,
          description: String,
          date: Date,
          recoveryTime: String,
          status: {
            type: String,
            enum: ["recovered", "recovering", "active"],
          },
        },
      ],
      lastPhysicalExam: Date,
      physicalExamNotes: String,
      doctorName: String,
      doctorPhone: String,
    },
sport: {
       primary: String,
       secondary: [String],
       position: String,
       teamId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Team",
       },
       sportCoordinatorId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
       },
     },
     information: {
       bio: String,
       goals: String,
       achievements: String,
       additionalNotes: String,
     },
   },
  {
    timestamps: true,
  }
);

athleteProfileSchema.index({ "sport.primary": 1 });
athleteProfileSchema.index({ "sport.teamId": 1 });

const AthleteProfile = mongoose.model("AthleteProfile", athleteProfileSchema);

module.exports = AthleteProfile;
