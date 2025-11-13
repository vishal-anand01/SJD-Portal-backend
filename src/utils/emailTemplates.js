// backend/src/utils/emailTemplates.js

export function getTemplate(name, context = {}) {
  switch (name) {
    case "assignment":
      return assignmentTemplate(context);
    default:
      return basicTemplate(context);
  }
}

function basicTemplate({ title = "Notification", message = "" }) {
  return `
    <div style="font-family:Arial,sans-serif;padding:16px;">
      <h2 style="margin:0 0 12px;">${escapeHtml(title)}</h2>
      <p style="margin:0 0 8px;">${escapeHtml(message)}</p>
    </div>
  `;
}

function assignmentTemplate({
  officerName = "Officer",
  dmName = "DM",
  visitDate,
  location = {},
  complaints = [],
  notes = "",
  assignmentId,
}) {
  const {
    district = "",
    block = "",
    panchayat = "",
    address = "",
  } = location || {};
  const when = visitDate ? new Date(visitDate).toLocaleString() : "TBD";
  const list =
    Array.isArray(complaints) && complaints.length
      ? `<ul>${complaints
          .map((c) => `<li>${escapeHtml(String(c))}</li>`)
          .join("")}</ul>`
      : "<p>No specific complaints attached.</p>";

  return `
    <div style="font-family:Arial,sans-serif;padding:16px;">
      <h2 style="margin:0 0 12px;">New Field Assignment</h2>
      <p>Dear ${escapeHtml(officerName)},</p>
      <p>You have a new assignment from <b>${escapeHtml(dmName)}</b>.</p>
      <p><b>Date/Time:</b> ${when}</p>
      <p><b>Location:</b> ${[address, panchayat, block, district]
        .filter(Boolean)
        .join(", ")}</p>
      <p><b>Assignment ID:</b> ${escapeHtml(String(assignmentId || ""))}</p>
      <p><b>Complaints:</b></p>
      ${list}
      ${notes ? `<p><b>Notes:</b> ${escapeHtml(notes)}</p>` : ""}
      <hr style="margin:16px 0;border:none;border-top:1px solid #eee;">
      <p style="color:#666;font-size:12px;">SJD Portal</p>
    </div>
  `;
}

function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
