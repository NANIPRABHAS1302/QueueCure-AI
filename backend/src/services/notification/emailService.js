import nodemailer from "nodemailer";

const getTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
        return nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });
    }
    return null;
};

export const sendEmail = async (to, subject, html) => {
    try {
        const transporter = getTransporter();

        if (transporter) {
            const mailOptions = {
                from: process.env.SMTP_FROM || '"QueueCure AI" <noreply@queuecure.com>',
                to,
                subject,
                html
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`✉️ Email Sent successfully to ${to}. Message ID: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } else {
            console.log(`\n--- ✉️ [MOCK EMAIL] ---`);
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content:\n${html.replace(/<[^>]*>/g, " ").trim().slice(0, 300)}...`);
            console.log(`-----------------------\n`);
            return { success: true, mock: true };
        }
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

// Queue & Appointment Templates
export const sendQueueTokenEmail = async (email, patientName, tokenNumber, position, waitTime) => {
    const subject = `🏥 QueueCure AI - Token Assigned (#${tokenNumber})`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #2563eb; text-align: center;">QueueCure AI Token</h2>
            <p>Dear <strong>${patientName}</strong>,</p>
            <p>Your hospital check-in was successful. You have been placed in the waiting queue.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
                <span style="font-size: 14px; color: #666; display: block; text-transform: uppercase;">Your Token Number</span>
                <span style="font-size: 36px; font-weight: bold; color: #1e3a8a; display: block; margin: 5px 0;">#${tokenNumber}</span>
                <span style="font-size: 14px; color: #555; display: block;">Queue Position: <strong>${position}</strong></span>
                <span style="font-size: 14px; color: #555; display: block;">Estimated Waiting Time: <strong>${waitTime} mins</strong></span>
            </div>
            <p style="font-size: 12px; color: #666;">You can track real-time queue status on your QueueCure patient dashboard.</p>
        </div>
    `;
    return await sendEmail(email, subject, html);
};

export const sendTokenCallEmail = async (email, patientName, tokenNumber, doctorName) => {
    const subject = `🚨 URGENT: Your Token (#${tokenNumber}) has been Called`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ef4444; border-radius: 8px;">
            <h2 style="color: #ef4444; text-align: center;">🚨 Queue Ticket Call Notification</h2>
            <p>Dear <strong>${patientName}</strong>,</p>
            <p style="font-size: 16px;">Your Token <strong>#${tokenNumber}</strong> is currently being called.</p>
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; border-left: 4px solid #ef4444;">
                <p style="margin: 0; font-size: 16px; color: #991b1b;">Please proceed immediately to <strong>Dr. ${doctorName}</strong>'s consultation cabin.</p>
            </div>
            <p style="font-size: 12px; color: #666;">Thank you for using QueueCure AI Hospital Queue Management.</p>
        </div>
    `;
    return await sendEmail(email, subject, html);
};

export const sendAppointmentEmail = async (email, patientName, appointmentDate, doctorName, status = "CONFIRMED") => {
    const subject = `🏥 Appointment ${status} - QueueCure AI`;
    const dateStr = new Date(appointmentDate).toLocaleString();
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #10b981; text-align: center;">Appointment Scheduled</h2>
            <p>Dear <strong>${patientName}</strong>,</p>
            <p>Your appointment has been registered successfully.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f9fafb;">
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; width: 35%;">Doctor</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">Dr. ${doctorName}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Date & Time</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${dateStr}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Status</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; color: #047857; font-weight: bold;">${status}</td>
                </tr>
            </table>
            <p style="font-size: 12px; color: #666;">If you need to reschedule or cancel, please visit the dashboard or contact the reception.</p>
        </div>
    `;
    return await sendEmail(email, subject, html);
};
