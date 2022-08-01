var nodemailer = require('nodemailer');

exports.sendMail = async (email_to, otpcode) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.AUTH_MAIL,
            pass: process.env.AUTH_PASSWORD
        }
    })
    var mailOptions = {
        from: '"Node base" vishva.py@gmail.com',
        to: `${email_to}`,
        subject: 'Your One Time Password',
        html: `<div style=" box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);background:#3d424e;height:350px;padding:30px;"><div style="text-align:center"><img src="https://i.ibb.co/WVmsnJR/your-logo.png" width="70" height="70"><p style="    font-size: 30px;color: white;          font-family: fangsong;          padding: 30px;">Welcome</p> <p          style="    color: white;          font-size: 19px;          font-family: fangsong;          border-bottom: 1px solid;          width: 279px;          margin: auto;">
    YOUR ONE TIME PASSWORD IS</p>   <p style=" padding: 15px; color: white; background: white;width: 58px;color: black;margin: auto; margin-top: 24px;"> ${otpcode}</p></div> <div>`
    }

    let d = await transporter.sendMail(mailOptions)
    if (d) {
        return true
    }else{
        return false
    }
}

exports.sendtokenMail = async (name,email_to, confirmationCode) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.AUTH_MAIL,
            pass: process.env.AUTH_PASSWORD
        }
    })
    var mailOptions = {
        from: '"Node base" vishva.py@gmail.com',
        to: `${email_to}`,
        subject: 'Please confirm your account',
        html: `<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
        <a href=https://localhost:4200/confirm/${confirmationCode}> Click here</a>
        </div>`,
    }

    let d = await transporter.sendMail(mailOptions)
    if (d) {
        return true
    }else{
        return false
    }
}

