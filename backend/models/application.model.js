import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    round: String,
    date: Date,
    notes: String,
    outcome: {
        type: String,
        enum: ["passed", "failed", "pending"],
        default: "pending"
    }
});

const applicationSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    company: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        required: true,
    },
   
      jobDescriptionUrl: String,
  jobDescriptionText: String,

    status: {
        type: String,
        enum: ["applied", "screening", "interview", "offer", "rejected", "ghosted"],
        default: "applied",
    },
    appliedDate: {
        type: Date,
        default: Date.now,
    },
    interviews: [interviewSchema],
    notes: String,
    salary: String,
     
},{timestamps: true});

export default mongoose.model("Application", applicationSchema);