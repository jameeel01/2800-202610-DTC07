const mongoose = require("mongoose");

const nominationSchema = new mongoose.Schema(
  {
    // Location
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      streetAddress: {
        type: String,
        required: true,
      },
      neighborhood: {
        type: String,
        trim: true,
      },
    },

    // Nominator Info
    nominatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nominatorName: {
      type: String,
      required: true,
    },
    nominatorEmail: {
      type: String,
      required: true,
    },

    // Nomination Details
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ["bus stop", "park", "sidewalk", "schoolyard", "plaza", "other"],
      required: true,
    },

    // Status and Tracking
    status: {
      type: String,
      enum: ["pending", "approved", "in_progress", "planted"],
      default: "pending",
    },
    upvoteCount: {
      type: Number,
      default: 0,
    },

    // Moderation
    isFlagged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Nomination", nominationSchema);
