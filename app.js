import express from "express";
import { connectDB } from './config.js/db.js';
import * as Routes from './routes/routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', Routes.indexRouter);
app.use('/faq', Routes.faqRouter);
app.use('/saftytips', Routes.tipsRouter);
app.use('/cyberCrimes', Routes.cyberRouter);
app.use('/about', Routes.aboutRouter);
app.use('/status', Routes.statusRouter);
app.use('/complaintId', Routes.complainRouter);
app.use('/contact', Routes.contactRouter);
app.use('/signup', Routes.signupRouter);
app.use('/verify', Routes.verifyRouter);
app.use('/login', Routes.loginRouter); 
app.use('/report', Routes.reportRouter); 

connectDB()
    .then(() => {
        app.listen(3000, () => {
            console.log("Server running at port 3000");
        });
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });