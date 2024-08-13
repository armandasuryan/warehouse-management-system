import nodemailer from 'nodemailer';
import chalk from 'chalk';

// nodemailer configuration
const transporter = nodemailer.createTransport({
    service: process.env.SMTP_HOST, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verifikasi koneksi transporter
transporter.verify((error, success) => {
    if (error) {
        const message = 'Error connecting to SMTP server:';
        const mailMsg = chalk.bgYellow.bold.red(message);
        console.log(mailMsg, error);
    } else {
        const message = 'SMTP server is ready to take messages';
        const mailMsg = chalk.bgYellow.bold.green(message);
        console.log(mailMsg);
    }
});

// generate otp
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
};

const nodemailConf = {
    transporter,
    generateOTP,
}

export default nodemailConf;
