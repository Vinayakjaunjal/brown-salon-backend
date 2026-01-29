const BirthdayCustomer = require("../models/BirthdayCustomer");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");
const { birthdayTemplate } = require("../utils/emailTemplates");

// ================= ADD CUSTOMER =================

exports.addCustomer = async (req, res) => {
  try {
    const { name, email, phone, dob } = req.body;

    if (!name || !dob) {
      return res.status(400).json({ message: "Name and DOB required" });
    }

    const customer = new BirthdayCustomer({
      name,
      email,
      phone,
      dob,
    });

    await customer.save();

    // 🎂 If birthday today → create notification
    const today = new Date();
    const dobDate = new Date(dob);

    if (
      today.getDate() === dobDate.getDate() &&
      today.getMonth() === dobDate.getMonth()
    ) {
      await Notification.create({
        title: "Birthday Today 🎂",
        message: `${name}'s birthday today`,
        type: "birthday",
        link: "/admin/birthdays",
      });
    }

    res.json({ success: true, customer });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add customer" });
  }
};

// ================= GET CUSTOMERS =================

exports.getCustomers = async (req, res) => {
  try {
    const customers = await BirthdayCustomer.find().sort({ dob: 1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

// ================= DELETE CUSTOMER =================

exports.deleteCustomer = async (req, res) => {
  try {
    await BirthdayCustomer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// ================= SEND BIRTHDAY WISH =================

exports.sendWish = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: "Name and email required" });
    }

    await sendEmail({
      to: email,
      subject: "🎂 Happy Birthday from Brown Hair Salon!",
      html: birthdayTemplate({ name }),
    });

    res.json({ success: true });
  } catch (err) {
    console.log("Birthday mail error:", err);
    res.status(500).json({ message: "Failed to send birthday wish" });
  }
};
