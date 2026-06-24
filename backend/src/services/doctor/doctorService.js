import Doctor from "../../models/Doctor.js";

export const createDoctor = async (doctorData) => {
    const doctor = await Doctor.create(doctorData);
    return doctor;
};

export const getAllDoctors = async () => {
    return await Doctor.find().sort({ createdAt: -1 });
};

export const getDoctorById = async (doctorId) => {
    return await Doctor.findById(doctorId);
};

export const updateDoctor = async (doctorId, data) => {
    return await Doctor.findByIdAndUpdate(
        doctorId,
        data,
        {
            new: true
        }
    );
};

export const deleteDoctor = async (doctorId) => {
    return await Doctor.findByIdAndDelete(doctorId);
};