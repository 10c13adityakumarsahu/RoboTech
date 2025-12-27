import nodemailer from "nodemailer";

export const sendPasswordEmail = async (email, link, type) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"RoboTech Website" <${process.env.MAIL_USER}>`,
    to: email,
    subject:
      type === "CHANGE"
        ? "Confirm Password Change – RoboTech"
        : "Reset Admin Password – RoboTech",
    html: `
      <p>You requested to ${
        type === "CHANGE" ? "change" : "reset"
      } your admin password.</p>
      <p><a href="${link}">Click here to continue</a></p>
      <p>This link expires in 15 minutes.</p>
    `,
  });
};
