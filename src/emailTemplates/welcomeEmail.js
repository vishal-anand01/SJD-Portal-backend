// backend/src/emailTemplates/welcomeEmail.js
export const generateWelcomeEmail = (user) => {
  const year = new Date().getFullYear();
  const loginUrl = `${process.env.FRONTEND_URL}/login`;
  const supportUrl = `${process.env.FRONTEND_URL}/contact`;

  return {
    subject: `🎉 Welcome ${user.firstName}! Your SJD-Portal Account is Ready`,
    html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Welcome to SJD-Portal</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#1e293b;">

    <!-- MAIN WRAPPER -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(30,58,138,0.1);">

            <!-- HEADER -->
            <tr>
              <td style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 50%,#f59e0b 100%);padding:26px;text-align:center;color:#fff;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Emblem_of_India.svg/120px-Emblem_of_India.svg.png" alt="Emblem of India" width="65" style="display:block;margin:0 auto 10px;" />
                <h1 style="margin:0;font-size:26px;font-weight:800;">SJD-Portal</h1>
                <p style="margin:6px 0 0;font-size:15px;opacity:0.9;">Smart Jan-Darbar | Citizen First Governance</p>
              </td>
            </tr>

            <!-- HERO SECTION -->
            <tr>
              <td style="background:#eef2ff;padding:18px;text-align:center;">
                <h2 style="color:#1e3a8a;font-size:22px;margin:0;font-weight:700;">Welcome, ${user.firstName}! 👋</h2>
                <p style="color:#475569;margin:6px 0 0;font-size:14px;">
                  आपकी शिकायतें अब होंगी पारदर्शी और तेज़।<br/>
                  <span style="color:#1e40af;font-weight:600;">Welcome to Smart Jan-Darbar Portal!</span>
                </p>
              </td>
            </tr>

            <!-- MAIN CONTENT -->
            <tr>
              <td style="padding:30px;">
                <p style="font-size:15px;color:#334155;line-height:1.7;margin-top:0;">
                  🎉 We’re delighted to have you on board, <strong>${user.firstName} ${user.lastName}</strong>!
                  Your account has been successfully created on <b>SJD-Portal</b>.
                  You can now:
                </p>

                <!-- FEATURES -->
                <ul style="list-style:none;padding:0;margin:12px 0 24px;">
                  <li style="margin:10px 0;color:#1e40af;font-weight:600;">✅ File and track complaints in real-time</li>
                  <li style="margin:10px 0;color:#2563eb;font-weight:600;">✅ View visit schedules & department updates</li>
                  <li style="margin:10px 0;color:#f59e0b;font-weight:600;">✅ Get transparent status with live notifications</li>
                </ul>

                <!-- ACCOUNT CARD -->
                <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;background:#f9fafb;margin-bottom:25px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <strong style="color:#1e293b;display:block;margin-bottom:6px;">Account Details</strong>
                      <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
                        <b>Name:</b> ${user.firstName} ${user.lastName}<br />
                        <b>Email:</b> ${user.email}<br />
                        <b>Role:</b> Citizen<br />
                        <b>Joined On:</b> ${new Date().toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA -->
                <div style="text-align:center;margin-bottom:28px;">
                  <a href="${loginUrl}" style="background:linear-gradient(90deg,#1e3a8a,#2563eb);color:#fff;text-decoration:none;padding:13px 34px;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 14px rgba(37,99,235,0.25);">
                    🔐 Login to Your Dashboard
                  </a>
                </div>

                <p style="font-size:14px;color:#475569;line-height:1.6;">
                  Need help? Our support team is here for you 24/7.<br />
                  संपर्क करें: <a href="${supportUrl}" style="color:#2563eb;text-decoration:none;">SJD Support</a>
                </p>
              </td>
            </tr>

            <!-- DIVIDER -->
            <tr>
              <td style="height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);"></td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background:#f8fafc;padding:22px;text-align:center;">
                <p style="margin:0 0 6px;color:#475569;font-size:13px;">
                  📍 SJD-Portal | Government of India | “Empowering Citizens through Transparency”
                </p>

                <!-- SOCIAL LINKS -->
                <div style="margin-top:8px;">
                  <a href="https://facebook.com" style="color:#1e3a8a;margin:0 6px;text-decoration:none;">🌐 Facebook</a> |
                  <a href="https://twitter.com" style="color:#1e3a8a;margin:0 6px;text-decoration:none;">🐦 Twitter</a> |
                  <a href="https://linkedin.com" style="color:#1e3a8a;margin:0 6px;text-decoration:none;">💼 LinkedIn</a>
                </div>

                <p style="margin-top:12px;font-size:12px;color:#94a3b8;">
                  © ${year} SJD-Portal | Designed for Citizens with ❤️ <br/>
                  Visit: <a href="${process.env.FRONTEND_URL}" style="color:#2563eb;text-decoration:none;">SJD-Portal Official Website</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
    text: `Welcome ${user.firstName}!

Your SJD-Portal account has been created successfully.
You can now login and access your citizen dashboard.

Login: ${loginUrl}
Support: ${supportUrl}

SJD-Portal — Smart Jan-Darbar | Citizen First Governance
© ${year} Government of India`,
  };
};
