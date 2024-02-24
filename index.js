import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
import { OTP } from './otpModel.js';
import { connectDB } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        console.log("Server is ready to take our messages");
    }
});

function generateOTP() {
    return crypto.randomBytes(3).toString('hex');
}

async function sendOTP(email, otp) {
    try {
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
        await OTP.create({email, otp: hashedOTP});
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
    } catch(error) {
        console.error('Error sending OTP:', error);
    }
}

app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
});

app.post('/signup', (req, res) => {
    const email = req.body.signupEmail;
    const otp = generateOTP();
    console.log("Generated otp: ", otp);
    sendOTP(email, otp);
    res.redirect("/verify");
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

app.post('/login', (req, res) => {
    const email = req.body.loginEmail;
    const otp = generateOTP();
    console.log("Generated otp: ", otp);
    sendOTP(email, otp);
    res.redirect("/verify");
});

app.get("/verify", (req, res) => {
    res.sendFile(__dirname + "/verify.html");
});

app.post('/verify', async (req, res) => {
    try {
        const email = req.body.email;
        const enteredOTP = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5 + req.body.otp6;

        const hashedEnteredOTP = crypto.createHash('sha256').update(enteredOTP).digest('hex');
        const otpData = await OTP.findOne({ email, otp: hashedEnteredOTP });

        if (!otpData) {
            res.status(400).send('Invalid verification code');
        } else {
            await OTP.deleteOne({ email }); 
            res.status(200).send('Verified successfully');
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).send('Internal Server Error');
    }
});

connectDB()
    .then(() => {
        app.listen(3000, () => {
            console.log("Server running at port 3000");
        });
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
});