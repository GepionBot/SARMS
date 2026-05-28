const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Media title is required"],
      trim: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["news", "announcement", "achievement", "event_highlight", "photo_gallery", "video", "press_release", "image", "document"],
      default: "news",
    },
    media: [
      {
        url: {
          type: String,
        },
        type: {
          type: String,
          enum: ["image", "video", "document"],
        },
        thumbnail: String,
        caption: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    sport: {
      type: String,
      required: [true, "Sport is required"],
      enum: ["basketball", "volleyball", "football", "swimming", "athletics", "badminton", "tennis"],
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "sport_internal", "team_only", "authenticated"],
      default: "authenticated",
    },
    targetAudience: [String],
    status: {
      type: String,
      enum: ["draft", "pending_review", "published", "archived"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [String],
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

mediaSchema.index({ sport: 1 });
mediaSchema.index({ teamId: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ status: 1 });
mediaSchema.index({ publishedAt: -1 });
mediaSchema.index({ authorId: 1 });

const Media = mongoose.model("Media", mediaSchema);

module.exports = Media;
