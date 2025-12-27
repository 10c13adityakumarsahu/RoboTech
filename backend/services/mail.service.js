import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendContactNotificationEmail(data) {
  const { name, email, subject, message } = data;

  await transporter.sendMail({
    from: `"RoboTech Website" <${process.env.MAIL_USER}>`,
    to: "vikashtondwals6@gmail.com",
    subject: `New Contact Message: ${subject || "No Subject"}`,
    html: `
      <h3>New Contact Message</h3>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Subject:</b> ${subject || "-"}</p>
      <p><b>Message:</b></p>
      <p>${message}</p>
    `,
  });
}


export async function sendSponsorshipNotificationEmail(data) {
  const { name, organization, phone, email, message } = data;

  await transporter.sendMail({
    from: `"RoboTech Website" <${process.env.MAIL_USER}>`,
    to: "vikashtondwals6@gmail.com",
    subject: "New Sponsorship Inquiry",
    html: `
      <h2>New Sponsorship Inquiry</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Organization:</b> ${organization || "-"}</p>
      <p><b>Phone:</b> ${phone || "-"}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b></p>
      <p>${message}</p>
    `
  });
}
