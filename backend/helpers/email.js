const Otp = require('../api/v1/models/otp.model');
const nodemailer = require('nodemailer');
const User = require('../api/v1/models/user.model');

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOtp = async (email, action) => {
    const existing = await Otp.findOne({email}).sort({ createdAt: -1 });
    const user = await User.findOne({ email });
    if (existing && action === 'REGISTER' && user.isVerified) {
        return { status: false, message: 'Email already exists' };
    }
    if (existing && existing.createdAt.getTime() > Date.now() - 5 * 60 * 1000) {
        return { status: false, message: 'OTP already sent to this email. Please wait for 5 minutes before requesting again.' };
    }
    const code = generateOtp();

    const otp = await Otp.create({
        email,
        code,
        action,
    });

    try{
        await transport.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${code}. It is valid for 5 minutes.`,
        });
    } catch (error) {
        await Otp.deleteOne({ _id: otp._id });
        console.error('Error sending email:', error);
        return { status: false, message: 'Failed to send OTP' };
    }

    return { status: true, message: 'OTP sent successfully' };
};

const verifyOtp = async (email, code, action) => {
    const otp = await Otp.findOne({ email, code, action });
    if (!otp) {
        return { status: false, message: 'Invalid OTP' };
    }
    const isExpired = otp.createdAt < Date.now() - 5 * 60 * 1000;
    if (isExpired) {
        await Otp.deleteOne({ _id: otp._id });
        return { status: false, message: 'OTP expired' };
    }
    await Otp.deleteOne({ _id: otp._id });
    return { status: true, message: 'OTP verified successfully' };
};

const sendEmail = async (email, subject, text) => {
    try {
        await transport.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject,
            text,
        });
        return { status: true, message: 'Email sent successfully' };
    } catch (error) {
        return { status: false, message: 'Failed to send email' };
    }
};

module.exports = {
    sendOtp,
    verifyOtp,
    sendEmail,
};