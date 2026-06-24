import { callNextToken } from "../../services/queue/callNextToken.js";

export const nextToken = async (req,res)=>{

    try{

        const patient = await callNextToken();

        res.json({

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