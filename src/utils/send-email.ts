import nodeMailer from "nodemailer";

export const sendEmailViaSMTP = async (
  email: string,
  otp: string,
  userId: string
) => {
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "vikas.nits8084@gmail.com",
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  try {
    const res = await transporter.sendMail({
      from: "vikas.nits8084@gmail.com",
      to: email,
      subject: "Reset your password!",

      html: `<div style={{display:"flex", alignItems:"center", flexDirection:"column", padding:"10px", gap:"5px"}}>
        <span>Your verification code:${otp} for expense tracker app </span>
        <a href='http://13.235.103.61:3000/password/reset-password.html'>
          Reset your password
        </a>
        <div>NOTE: Please do not share this otp with anyone!</div>
        </div>
        `,
    });
    return {
      status: 200,
      body: res,
    };
  } catch (e) {
    return {
      status: 500,
      error: e.message,
    };
  }
};
