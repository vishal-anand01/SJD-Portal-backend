// backend/src/config/mailer.js
import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

const {
  SMTP_HOST = "smtp.gmail.com",
  SMTP_PORT = "587",
  SMTP_SECURE = "false",
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM = "",
} = process.env;

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: SMTP_SECURE === "true", // true => 465, false => 587/25
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

export const defaultFrom =
  MAIL_FROM || (SMTP_USER ? `"SJD Portal" <${SMTP_USER}>` : undefined);

export async function verifyMailer() {
  try {
    await transporter.verify();
    logger.info("📧 Mail transporter connected successfully.");
    // eslint-disable-next-line no-console
    console.log("📧 Mail transporter connected successfully.");
  } catch (err) {
    logger.warn("⚠️ Mail transporter verification failed", { error: err?.message || err });
  }
}
