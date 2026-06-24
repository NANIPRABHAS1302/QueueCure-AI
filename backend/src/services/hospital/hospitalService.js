import Hospital from "../../models/Hospital.js";

export const createHospital = async (hospitalData) => {
    return await Hospital.create(hospitalData);
};

export const getAllHospitals = async () => {
    return await Hospital.find().sort({ createdAt: -1 });
};

export const getHospitalById = async (hospitalId) => {
    return await Hospital.findById(hospitalId);
};

export const updateHospital = async (hospitalId, data) => {
    return await Hospital.findByIdAndUpdate(
        hospitalId,
        data,
        { new: true }
    );
};

export const deleteHospital = async (hospitalId) => {
    return await Hospital.findByIdAndDelete(hospitalId);
};