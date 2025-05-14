import nodemailer from 'nodemailer';

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (email, otp) => {
  try {
    console.log(`[sendOTP] Attempting to send OTP to ${email}`);
    
    // Check if email credentials are available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('[sendOTP] Missing email credentials in environment variables');
      return; // Return without throwing to not block attendance process
    }
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Attendance OTP Verification',
      text: `Your OTP for attendance verification is: ${otp}. This OTP will expire in 15 minutes.`
    };

    console.log(`[sendOTP] Preparing to send email to ${email}`);
    await transporter.sendMail(mailOptions);
    console.log(`[sendOTP] Successfully sent OTP to ${email}`);
  } catch (error) {
    console.error('[sendOTP] Error sending email:', error);
    // Don't throw the error to avoid blocking attendance flow
    // Just log it and continue
  }
}; 