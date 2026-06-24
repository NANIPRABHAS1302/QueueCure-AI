import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
{
    tokenNumber: {
        type: Number,
        required: true
    },

    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },

    status: {
        type: String,
        enum: [
            "WAITING",
            "CONSULTING",
            "COMPLETED"
        ],
        default: "WAITING"
    },

    queuePosition: {
        type: Number,
        default: 0
    },

    estimatedWaitTime: {
        type: Number,
        default: 0
    }

},
{
    timestamps: true
});

export default mongoose.model("Queue", queueSchema);