import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
import { OTP } from './Model.js';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take messages");
    }
});

export function generateOTP() {
    return crypto.randomBytes(3).toString('hex');
}

export async function sendOTP(email, otp) {
    try {
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
        await OTP.create({ email, otp: hashedOTP });
        const mailOptions = {
            from: 'navdeepkore283@gmail.com',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP for verification is: ${otp}. Please note that this OTP will expire after 5 minutes.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending OTP:', error);
            } else {
                console.log('OTP sent:', info.response);
            }
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
}