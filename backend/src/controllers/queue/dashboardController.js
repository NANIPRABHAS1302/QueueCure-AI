import Queue from "../../models/Queue.js";

export const getCurrentToken = async (req, res) => {

    try {

        const currentToken = await Queue
            .findOne({ status: "CONSULTING" })
            .populate("patient");

        res.json({
            success: true,
            currentToken
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export const getWaitingQueue = async (req, res) => {

    try {

        const waitingPatients = await Queue
            .find({ status: "WAITING" })
            .populate("patient")
            .sort({ tokenNumber: 1 });

        res.json({
            success: true,
            totalWaiting: waitingPatients.length,
            waitingPatients
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};