import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
{
    patientId: {
        type: String,
        unique: true
    },

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    age: {
        type: Number,
        required: true
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },

    phone: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        default: ""
    },

    bloodGroup: {
        type: String,
        default: ""
    },

    address: {
        type: String,
        default: ""
    },

    symptoms: {
        type: String,
        required: true
    },

    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "EMERGENCY"],
        default: "LOW"
    },

    status: {
        type: String,
        enum: [
            "WAITING",
            "IN_QUEUE",
            "CONSULTING",
            "COMPLETED",
            "CANCELLED"
        ],
        default: "WAITING"
    },

    tokenNumber: {
        type: Number,
        default: 0
    },

    queuePosition: {
        type: Number,
        default: 0
    },

    estimatedWaitTime: {
        type: Number,
        default: 0
    },

    assignedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        default: null
    }

},
{
    timestamps: true
});

export default mongoose.model("Patient", patientSchema);