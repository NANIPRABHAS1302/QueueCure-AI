import * as patientService from "../../services/patient/patientService.js";

export const createPatient = async(req,res)=>{

    try{

        const patient = await patientService.createPatient(req.body);

        res.status(201).json({

            success:true,

            patient

        });

    }

    catch(error){

        res.status(400).json({

            success:false,

            message:error.message

        });

    }

};

export const getPatients = async(req,res)=>{

    const patients = await patientService.getPatients();

    res.json({

        success:true,

        patients

    });

};

export const getPatient = async(req,res)=>{

    const patient = await patientService.getPatientById(req.params.id);

    res.json({

        success:true,

        patient

    });

};

export const updatePatient = async(req,res)=>{

    const patient = await patientService.updatePatient(

        req.params.id,

        req.body

    );

    res.json({

        success:true,

        patient

    });

};

export const deletePatient = async(req,res)=>{

    await patientService.deletePatient(req.params.id);

    res.json({

        success:true,

        message:"Patient Deleted"

    });

};