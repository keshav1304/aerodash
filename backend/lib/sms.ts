import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhone = process.env.TWILIO_PHONE_NUMBER

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

export async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!client || !twilioPhone) {
    console.log('SMS not configured. Would send:', { to, message })
    return false
  }

  try {
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to,
    })
    return true
  } catch (error) {
    console.error('Error sending SMS:', error)
    return false
  }
}

export function formatMatchNotification(
  travelerName: string,
  senderName: string,
  origin: string,
  destination: string
): string {
  return `New Match! ${travelerName} is traveling from ${origin} to ${destination} and can carry your package. Contact them through the app!`
}

