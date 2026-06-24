// SMS Notification Service

export const sendSMS = async (to, body) => {
    try {
        const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
            // Dynamically import twilio if configured to make it light
            const twilio = (await import("twilio")).default;
            const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

            const message = await client.messages.create({
                body,
                from: TWILIO_PHONE_NUMBER,
                to
            });

            console.log(`📱 SMS Sent successfully to ${to}. Message SID: ${message.sid}`);
            return { success: true, sid: message.sid };
        } else {
            // Development fallback logging
            console.log(`\n--- 📱 [MOCK SMS] ---`);
            console.log(`To: ${to}`);
            console.log(`Message: ${body}`);
            console.log(`-----------------------\n`);
            return { success: true, mock: true };
        }
    } catch (error) {
        console.error(`❌ Failed to send SMS to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

// Ready-to-use template builders
export const sendQueueKioskAlert = async (phone, tokenNumber, position, waitTime) => {
    const body = `🏥 QueueCure AI: Token generated successfully! Your Token Number is #${tokenNumber}. Current position: ${position}. Estimated wait time: ${waitTime} mins. Please monitor the queue screen.`;
    return await sendSMS(phone, body);
};

export const sendTokenCallAlert = async (phone, tokenNumber, doctorName) => {
    const body = `🏥 QueueCure AI ALERT: Token #${tokenNumber} is being called now. Please proceed to Dr. ${doctorName}'s consulting room immediately.`;
    return await sendSMS(phone, body);
};

export const sendAppointmentReminderAlert = async (phone, appointmentDate, doctorName) => {
    const dateStr = new Date(appointmentDate).toLocaleString();
    const body = `🏥 QueueCure AI Reminder: You have an upcoming appointment scheduled with Dr. ${doctorName} on ${dateStr}. Please arrive 10 minutes early.`;
    return await sendSMS(phone, body);
};
