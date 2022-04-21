//email

//notifications

//otp
export const GenerateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000)
  let expiry = new Date()
  expiry.setTime( new Date().getTime() + (30*60*1000) )

  return { otp, expiry }
}

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {

  const accountSid = 'ACb8b1d48c11ef9fd043adb24ef9edd065'
  const authToken = 'cdb471318bc5ae2b5d14b5d84a1e99c4'
  const client = require('twilio')(accountSid, authToken);

  const response = await client.messages.create({
    body: `Ваш одноразовый пароль: ${otp}`,
    from: '+19378883537',
    to: `+7${toPhoneNumber}`,
  })
  return response;

}

//pyament notification or emails
