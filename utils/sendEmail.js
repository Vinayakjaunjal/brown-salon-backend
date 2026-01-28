const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

module.exports = async ({ to, subject, html }) => {
  await apiInstance.sendTransacEmail({
    sender: { email: "brown.unisex.salon@gmail.com", name: "Brown Salon" },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });
};
