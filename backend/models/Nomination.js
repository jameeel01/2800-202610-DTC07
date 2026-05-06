const mongoose = require("mongoose");

const nominationSchema = new mongoose.Schema(
  {
    // geo coords & address
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

    // who nominated it
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

    // nomination details
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

    // status & engagement
    status: {
      type: String,
      enum: ["pending", "approved", "in_progress", "planted"],
      default: "pending",
    },
    upvoteCount: {
      type: Number,
      default: 0,
    },

    // flagging system
    isFlagged: {
      type: Boolean,
      default: false,
    },

    // file uploads
    uploadedFiles: [
      {
        fileName: {
          type: String,
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

// prevent same user from nominating same spot twice
nominationSchema.index(
  { nominatorId: 1, "location.latitude": 1, "location.longitude": 1 },
  { unique: true },
);

module.exports = mongoose.model("Nomination", nominationSchema);
