import { addToQueue } from "../../services/queue/queueService.js";

export const createQueue = async(req,res)=>{

    try{

        const queue = await addToQueue(

            req.body.patientId

        );

        res.status(201).json({

            success:true,

            queue

        });

    }

    catch(error){

        res.status(400).json({

            success:false,

            message:error.message

        });

    }

};