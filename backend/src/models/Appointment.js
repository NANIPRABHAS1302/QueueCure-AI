import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
{
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor"
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: [
            "PENDING",
            "CONFIRMED",
            "COMPLETED",
            "CANCELLED"
        ],
        default: "PENDING"
    }
},
{
    timestamps: true
}
);

export default mongoose.model(
    "Appointment",
    appointmentSchema
);