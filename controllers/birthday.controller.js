const BirthdayCustomer = require("../models/BirthdayCustomer");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");

// ================= LOGO =================

const LOGO_URL =
  "https://res.cloudinary.com/dsjypyora/image/upload/v1769510490/brown-circle-logo_bm8nhy.png";

// ================= FOOTER =================

const FOOTER = `
<hr style="margin:20px 0;border:none;border-top:1px solid #eee;"/>

<p style="font-size:13px;color:#555;">
📞 +91-XXXXXXXXXX <br/>
🌐 www.brownhairsalon.com <br/>
📍 Brown Hair The Unisex Salon, India
</p>

<p style="font-size:12px;color:#999;">
You received this email from Brown Hair Salon.
</p>
`;

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

// ================= BIRTHDAY EMAIL TEMPLATE =================

const birthdayTemplate = (name) => `
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#f6f4f0;padding:30px;">

<div style="max-width:650px;margin:auto;background:#fff;padding:25px;border-radius:10px;">

  <div style="text-align:center;margin-bottom:20px;">
    <img src="${LOGO_URL}" style="width:80px;" />
  </div>

  <h2 style="text-align:center;color:#6b3f1d;">
    🎉 Happy Birthday ${name}!
  </h2>

  <p>
    Wishing you a day filled with joy, happiness and great style ✨
  </p>

  <div style="background:#f1ede7;padding:15px;border-radius:8px;">
    <p>
      On your special day, the entire team at 
      <b>Brown Hair – The Unisex Salon</b> 
      wishes you success, confidence and beautiful moments 💇‍♂️💇‍♀️
    </p>
  </div>

  <p style="margin-top:20px;">
    🎁 Visit us soon and enjoy your birthday glow!
  </p>

  <p>
    Warm wishes,<br/>
    <b>Team Brown Hair Salon</b>
  </p>

  ${FOOTER}

</div>
</body>
</html>
`;

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
      html: birthdayTemplate(name),
    });

    res.json({ success: true });
  } catch (err) {
    console.log("Birthday mail error:", err);
    res.status(500).json({ message: "Failed to send birthday wish" });
  }
};
