// backend/src/services/emailService.js
import { transporter, defaultFrom } from "../config/mailer.js";
import logger from "../utils/logger.js";
import { getTemplate } from "../utils/emailTemplates.js";

export async function sendEmail({ to, subject, html, text, from }) {
  if (!to) throw new Error("sendEmail: 'to' is required");
  if (!subject) throw new Error("sendEmail: 'subject' is required");
  if (!html && !text)
    throw new Error("sendEmail: 'html' or 'text' is required");

  const mailOptions = {
    from: from || defaultFrom,
    to,
    subject,
    html,
    text: text || "Please view this email in HTML mode.",
  };

  const info = await transporter.sendMail(mailOptions);
  logger.info(`Email sent`, { to, messageId: info?.messageId });
  return info;
}

export async function sendAssignmentEmail({
  to,
  subject = "New Field Assignment",
  context = {},
  template = "assignment",
  from,
}) {
  const html = getTemplate(template, context);
  return sendEmail({ to, subject, html, from });
}
