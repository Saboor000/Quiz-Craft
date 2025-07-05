import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "saboorsamad010@gmail.com", // your Gmail address
      pass: "uitkpfxehuzgfgeu", // your Gmail app password
    },
  });

  await transporter.sendMail({
    from: "saboorsamad010@gmail.com",
    to: email,
    subject: "Your Email Verification OTP",
    html: `
      <h3>Email Verification</h3>
      <p>Your OTP code is:</p>
      <h2>${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    `,
  });
};
