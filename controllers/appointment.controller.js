const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");

const {
  customerPendingTemplate,
  adminNewAppointmentTemplate,
  statusUpdateTemplate,
} = require("../utils/emailTemplates");

// ================= CREATE =================

exports.createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      status: "pending",
    });

    await appointment.save();

    await Notification.create({
      title: "New Appointment",
      message: `${appointment.name} booked for ${appointment.date}`,
      type: "appointment",
      link: "/admin/appointments",
    });

    // CUSTOMER EMAIL
    await sendEmail({
      to: appointment.email,
      subject: "Appointment Request Received | Brown Hair Salon",
      html: customerPendingTemplate(appointment),
    });

    // ADMIN EMAIL
    await sendEmail({
      to: appointment.email,
      subject: "New Appointment Request | Action Required",
      html: adminNewAppointmentTemplate(appointment),
    });

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error saving appointment" });
  }
};

// ================= GET =================

exports.getAppointments = async (req, res) => {
  const { date } = req.query;
  const query = date ? { date } : {};
  const data = await Appointment.find(query);
  res.json(data);
};

// ================= UPDATE STATUS =================

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    await sendEmail({
      to: appointment.email,
      subject: "Appointment Status Update | Brown Hair Salon",
      html: statusUpdateTemplate(appointment, status),
    });

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Status update failed" });
  }
};
