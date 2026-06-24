import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
{
    fullName: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    experience: {
        type: Number,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
}
);

export default mongoose.model("Doctor", doctorSchema);