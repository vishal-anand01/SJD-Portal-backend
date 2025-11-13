import DMVisitAssignment from "../models/DMVisitAssignment.js";
import User from "../models/User.js";
import emailService from "./emailService.js";

export const assignVisit = async (data) => {
  const assignment = await DMVisitAssignment.create(data);

  const officer = await User.findById(data.officer);
  if (officer?.email) {
    await emailService.sendEmail({
      to: officer.email,
      subject: "New Visit Assignment",
      html: `<p>Dear ${officer.name},</p>
             <p>You have been assigned a visit on <b>${new Date(
               data.visitDate
             ).toDateString()}</b> 
             at ${data.village}, ${data.block}, ${data.district}.</p>
             <p>Please check your officer dashboard for details.</p>`,
    });
  }

  return assignment;
};

export const getDMVisits = async (dmId) => {
  return await DMVisitAssignment.find({ dm: dmId })
    .populate("officer", "name email")
    .sort({ createdAt: -1 });
};

export const getOfficerVisits = async (officerId) => {
  return await DMVisitAssignment.find({ officer: officerId }).sort({
    createdAt: -1,
  });
};
