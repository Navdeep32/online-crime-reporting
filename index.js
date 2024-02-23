import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv"

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const otpMap = new Map();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: "smtp.gmail.com",
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

function sendOTP(email, otp) {
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    const mailOptions = {
        from: 'crimereports3@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP for verification is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending OTP:', error);
        } else {
            console.log('OTP sent:', info.response);
        }
    });
}

app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
});

app.post('/signup', (req, res) => {
    const email = req.body.signupEmail;
    const otp = generateOTP();
    console.log("Generated otp: ", otp);
    sendOTP(email, otp);
    otpMap.set(email, otp);
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
    otpMap.set(email, otp);

    res.redirect("/verify");
});

app.get("/verify", (req, res) => {
    res.sendFile(__dirname + "/verify.html");
});

app.post('/verify', (req, res) => {
    const email = req.body.email;
    const enteredOTP = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5 + req.body.otp6;

    console.log('Entered OTP:', enteredOTP);
    console.log('Stored OTP:', otpMap.get(email));

    if (!otpMap.has(email) || otpMap.get(email) !== enteredOTP) {
        res.status(400).send('Invalid verfication code');
    } else {
        otpMap.delete(email);
        res.status(200).send('Verified successfully');
    }
});

app.listen(3000, () => {
    console.log("Server running at port 3000");
});