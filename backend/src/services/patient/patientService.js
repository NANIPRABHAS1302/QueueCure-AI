import Patient from "../../models/Patient.js";
import { v4 as uuidv4 } from "uuid";

// Create Patient
export const createPatient = async (data) => {

    const patient = await Patient.create({

        patientId: "PAT-" + uuidv4().slice(0,8).toUpperCase(),

        fullName: data.fullName,

        age: data.age,

        gender: data.gender,

        phone: data.phone,

        email: data.email,

        bloodGroup: data.bloodGroup,

        address: data.address,

        symptoms: data.symptoms,

        priority: data.priority

    });

    return patient;

};

// Get All Patients
export const getPatients = async () => {

    return await Patient.find().sort({ createdAt: -1 });

};

// Get Patient By ID
export const getPatientById = async (id) => {

    return await Patient.findById(id);

};

// Update Patient
export const updatePatient = async (id,data)=>{

    return await Patient.findByIdAndUpdate(

        id,

        data,

        {new:true}

    );

};

// Delete Patient
export const deletePatient = async(id)=>{

    return await Patient.findByIdAndDelete(id);

};