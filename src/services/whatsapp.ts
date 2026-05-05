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

  // To enable REAL WhatsApp messages, you need a provider. For example, using UltraMsg (very easy HTTP API)
  // 1. Sign up at ultramsg.com
  // 2. Get an Instance ID and a Token.
  // 3. Set process.env.ULTRAMSG_INSTANCE_ID and process.env.ULTRAMSG_TOKEN in your platform settings.
  // Uncomment the code below once configured:

  /*
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;

  if (instanceId && token) {
    try {
      const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: token,
          to: `+${formattedNumber}`,
          body: message
        })
      });
      const result = await response.json();
      console.log("Real WhatsApp API Responded:", result);
    } catch(err) {
      console.error("Failed to send real WhatsApp message:", err);
    }
  }
  */
};

