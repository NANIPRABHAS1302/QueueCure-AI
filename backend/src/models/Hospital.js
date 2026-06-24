import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
{
    hospitalName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: String,
    state: String,
    contactNumber: String,
    email: String
},
{
    timestamps: true
}
);

export default mongoose.model("Hospital", hospitalSchema);