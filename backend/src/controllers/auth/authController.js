import * as authService from "../../services/auth/authService.js";

export const register = async(req,res)=>{

    try{

        const user = await authService.registerUser(req.body);

        res.status(201).json({

            success:true,

            message:"User Registered",

            user

        });

    }

    catch(error){

        res.status(400).json({

            success:false,

            message:error.message

        });

    }

};

export const login = async(req,res)=>{

    try{

        const result = await authService.loginUser(

            req.body.email,

            req.body.password

        );

        res.json(result);

    }

    catch(error){

        res.status(400).json({

            success:false,

            message:error.message

        });

    }

};