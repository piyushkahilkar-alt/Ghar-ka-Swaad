export const sendWhatsAppMessage = async (to: string, message: string) => {
  // Format the number to ensure it has a country code, assuming India (+91) if 10 or 9 digits
  let formattedNumber = to.replace(/\D/g, '');
  if (formattedNumber.length === 10 || formattedNumber.length === 9) {
    formattedNumber = `91${formattedNumber}`;
  }

  console.log(`\n================ WHATSAPP NOTIFICATION ================`);
  console.log(`To: +${formattedNumber}`);
  console.log(`Message:\n${message}`);
  console.log(`=======================================================\n`);

  // TODO: Add real WhatsApp Business API / Twilio / UltraMsg integration here.
  // Example for Twilio:
  /*
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);
  
  try {
    await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886',
      to: `whatsapp:+${formattedNumber}`
    });
    console.log("WhatsApp message sent successfully via Twilio.");
  } catch (err) {
    console.error("Twilio WhatsApp error:", err);
  }
  */

  // Example for Generic HTTP WhatsApp API (like UltraMsg, WATI, etc):
  /*
  try {
    await fetch(`https://api.ultramsg.com/your_instance/messages/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        token: process.env.WHATSAPP_API_TOKEN || '',
        to: formattedNumber,
        body: message
      })
    });
  } catch(e) {}
  */
};
