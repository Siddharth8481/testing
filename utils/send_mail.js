var nodemailer = require("nodemailer");
const fs = require("fs");

module.exports = {
  requestMessageMail: async (data) => {
    var transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, //smtp.gmail.com

      port: process.env.MAIL_PORT, //587
      secureConnection: true, // TLS requires secureConnection to be false

      auth: {
        user: process.env.MAIL_FROM_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
        authentication: "plain",
      },
    });

    // style="background-image: url(${process.env.BACKGROUND});

    var sendOtp = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: data.emailAddress,
      subject: "Ad Anima",
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title></title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;1,700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0;font-family: 'Poppins', sans-serif;">
        <div style="background-color:#e2f9ff; max-width: 415px; margin: 0 auto; padding: 40px;background-size: cover; background-position: center;border: 4px solid rgba(255, 255, 255, 0.40); box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.12); border-radius: 20px;">
      
          <div style="text-align: center;">
            <img src="${process.env.APP_LOGO}" alt="Logo Image" style="max-width: 100%;">
          </div>  
      
          <h2 style="margin-bottom: 40px;margin-top: -10px; font-size: 20px;font-weight: 600;color: #000000; text-align:center;">
            You Received a Message from ${data.msg_user_name} on Ad Anima Platform
          </h2>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;max-width: 415px;">
            To View your Messages  Claim your Listing And start sharing your gifts on AD ANIMA community
          </p>
      
          <div style="display: flex; justify-content: center; margin-bottom: 20px;">
            <a href="${process.env.VIEW_PROFILE_LINK}/${data.redirect_id}">
              <img src="${process.env.VIEW_PROFILE}" alt="">
            </a>
          </div>
      
          <p style="font-weight: 500; font-size: 17px; line-height: 22px; color: #0c5c6c; margin: 0 0 15px 0; max-width: 415px; display: flex; justify-content: center;">
            IT’S FREE
          </p>
      
          <div style="margin-top: 30px;font-weight: 500;font-size: 15px;color: #000000;">
            Thank You,<br> Ad Anima team
          </div>
      
        </div>
      </body>
      </html>`,
    };

    return await transporter.sendMail(sendOtp);
  },

  guestrequestMessageMail: async (data) => {
    var transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, //smtp.gmail.com

      port: process.env.MAIL_PORT, //587
      secureConnection: true, // TLS requires secureConnection to be false

      auth: {
        user: process.env.MAIL_FROM_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
        authentication: "plain",
      },
    });

    // style="background-image: url(${process.env.BACKGROUND});

    var sendOtp = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: data.emailAddress,
      subject: "Ad Anima",
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title></title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;1,700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0;font-family: 'Poppins', sans-serif;">
        <div style="background-color:#e2f9ff; max-width: 415px; margin: 0 auto; padding: 40px;background-size: cover; background-position: center;border: 4px solid rgba(255, 255, 255, 0.40); box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.12); border-radius: 20px;">
      
          <div style="text-align: center;">
            <img src="${process.env.APP_LOGO}" alt="Logo Image" style="max-width: 100%;">
          </div>  
      
          <h2 style="margin-bottom: 40px;margin-top: -10px; font-size: 20px;font-weight: 600;color: #000000; text-align:center;">
            You Received a Message from Ad Anima Platform
          </h2>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;max-width: 415px;">
                <b>Message:</b> ${data.msg}
          </p>
      
          <div style="display: flex; justify-content: center; margin-bottom: 20px;">
            <a href="${process.env.VIEW_PROFILE_LINK}/${data.redirect_id}">
              <img src="${process.env.VIEW_PROFILE}" alt="">
            </a>
          </div>
      
          <p style="font-weight: 500; font-size: 17px; line-height: 22px; color: #0c5c6c; margin: 0 0 15px 0; max-width: 415px; display: flex; justify-content: center;">
            IT’S FREE
          </p>
      
          <div style="margin-top: 30px;font-weight: 500;font-size: 15px;color: #000000;">
            Thank You,<br> Ad Anima team
          </div>
      
        </div>
      </body>
      </html>`,
    };

    return await transporter.sendMail(sendOtp);
  },

  emailsendOtpCode: async (data) => {
    var transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, //smtp.gmail.com

      port: process.env.MAIL_PORT, //587
      secureConnection: true, // TLS requires secureConnection to be false

      auth: {
        user: process.env.MAIL_FROM_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
        authentication: "plain",
      },
    });

    // style="background-image: url(${process.env.BACKGROUND});

    var sendOtp = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: data.emailAddress,
      subject: "Ad Anima",
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title></title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;1,700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0;font-family: 'Poppins', sans-serif;">
        <div style="background-color:#e2f9ff; max-width: 415px; margin: 0 auto; padding: 40px;background-size: cover; background-position: center;border: 4px solid rgba(255, 255, 255, 0.40); box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.12); border-radius: 20px;">
        
          <div style="text-align: center;">
            <img src="${process.env.APP_LOGO}" alt="Logo Image" style="max-width: 100%;">
          </div>
      
          <p style="font-weight: 600;font-size: 20px;line-height: 30px;color: #000000; margin: 0 0 10px 0;">Hello  ${data.emailAddress}</p>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 0 0;">Thank you for signing up with AD Anima! To ensure the security of your account, we require email verification.</p>
      
          <h2 style="margin-bottom: 40px;margin-top: 20px; font-size: 20px;font-weight: 500;line-height: 31px;color: #000000; text-align:center;font-weight: 600; font-size: 20px; line-height: 34px; color: #000000; border-radius: 5px; background: linear-gradient(90deg, #5CCBEA -4.34%, #EFD296 103.9%); padding: 15px; text-align: center;">Your OTP for email verification is<br><span style="display:block;margin-top: 20px;font-weight: 700;font-size: 54px;color: #000000;">${data.otp}</span></h2>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;">Please enter this OTP on the verification page to complete the registration process. Please note that the OTP is valid for a limited time and should not be shared with anyone.</p>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;">If you did not attempt to sign up with AD Anima, please ignore this email. Your account will not be activated unless you verify your email.</p>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767; margin: 15px 0px; ">If you have any questions or need assistance, please contact our support team at <a href="mailto:info@ad-anima.com" style="font-weight:600;color: #000000;">${process.env.MAIL_FROM_ADDRESS}</a></p>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;">Thank you for choosing AD Anima. We look forward to serving you!</p>
      
          <div style="margin-top: 30px;font-weight: 500;font-size: 15px;color: #000000;">
            Thank You,<br> Ad Anima team
          </div>
        </div>
      </body>
      </html>
      </html>`,
    };

    return await transporter.sendMail(sendOtp);
  },

  sendOtpCode: async (data) => {
    var transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, //smtp.gmail.com
      port: process.env.MAIL_PORT, //587
      // secure: false, // Use SSL
      auth: {
        user: process.env.MAIL_FROM_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    var sendOtp = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: data.emailAddress,
      subject: "Ad Anima",
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title></title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;1,700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0;font-family: 'Poppins', sans-serif;">
        <div style="background-color:#e2f9ff; max-width: 415px; margin: 0 auto; padding: 40px;background-size: cover; background-position: center;border: 4px solid rgba(255, 255, 255, 0.40); box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.12); border-radius: 20px;">
          <div style="text-align: center;">
            <img src="${process.env.APP_LOGO}" alt="Logo Image" style="max-width: 100%;">
          </div>
          <p style="font-weight: 600;font-size: 20px;line-height: 30px;color: #000000; margin: 0 0 10px 0;">Hello ${data.name},</p>
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 0 0;">We’ve received a request to reset your Password. If you didn’t make the request, just ignore email.</p>
          <h2 style="font-weight: 600; font-size: 20px; line-height: 34px; color: #000000; border-radius: 5px; background: linear-gradient(90deg, #5CCBEA -4.34%, #EFD296 103.9%); padding: 15px; text-align: center;">Your Verification code is<br><span style="display:block;margin-top: 20px;font-weight: 700;font-size: 54px;color: #000000;">${data.otp}</span></h2>
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 0 0;">Please do not share your code with anyone else.</p>
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767; margin: 15px 0 0; ">If you have any questions or trouble logging on please contact <a href="mailto:info@ad-anima.com" style="font-weight:600;color: #000000;">${process.env.MAIL_FROM_ADDRESS}</a></p>	
          <div style="margin-top: 30px;font-weight: 500;font-size: 15px;color: #000000;">
            Thank You,<br> Ad Anima team
          </div>
        </div>
      </body>
      </html>`,
    };

    return await transporter.sendMail(sendOtp);
  },

  sendGuestUserPassword: async (data) => {
    var transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, //smtp.gmail.com
      port: process.env.MAIL_PORT, //587
      // secure: false, // Use SSL
      auth: {
        user: process.env.MAIL_FROM_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    var sendpassword = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: data.emailAddress,
      subject: "Ad Anima",
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title></title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;1,700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0;font-family: 'Poppins', sans-serif;">
        <div style="background-color:#e2f9ff; max-width: 415px; margin: 0 auto; padding: 40px;background-size: cover; background-position: center;border: 4px solid rgba(255, 255, 255, 0.40); box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.12); border-radius: 20px;">
      
          <div style="text-align: center;">
            <img src="${process.env.APP_LOGO}" alt="Logo Image" style="max-width: 100%;">
          </div>
      
          <h2 style="margin-bottom: 40px;margin-top: -10px; font-size: 25px;font-weight: 600;line-height: 0px;color: #000000; text-align:center;">Welcome to AD ANIMA!</h2>
      
          <p style="font-size: 17px; font-weight: 600; color: #3E555B;">Dear ${data.name},</p>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;max-width: 415px;">
            Welcome to AD ANIMA! We are excited to have you on board. Your account was successfully created. Below, you will find your temporary password to log in to our platform:
          </p>
      
          <p style="font-weight: 600; font-size: 20px; line-height: 34px; color: #000000; border-radius: 5px; background: linear-gradient(90deg, #5CCBEA -4.34%, #EFD296 103.9%); padding: 15px; text-align: center;">
            Temporary Password: ${data.password} <span style="display: flex; justify-content: center; font-size: 13px; font-weight: 500; color: #4a4a4a;  margin-top: 9px; line-height: 19px;"></span>
          </p>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;max-width: 415px;">
            Note: Your password is set to expire in 5 days. Please make sure to update it before it expires to avoid any inconvenience.
          </p>
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;max-width: 415px;">
            Please use this temporary password to access your account. For security reasons, we recommend changing this password after your initial login.
          </p>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;max-width: 415px;">
            If you have any questions or need assistance, please don't hesitate to reach out to our support team at
            <a href="#" style="font-weight: 600; color: #000000;">${process.env.MAIL_FROM_ADDRESS}</a>
          </p>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;max-width: 415px;">
            We look forward to serving you and hope you have a great experience with us.
          </p>
      
          <div style="margin-top: 30px;font-weight: 500;font-size: 15px;color: #000000;">
            Thank You,<br> Ad Anima team
          </div>
      
        </div>
      </body>
      </html>`,
    };

    return await transporter.sendMail(sendpassword);
  },

  sendTemporaryPassword: async (data) => {
    var transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, //smtp.gmail.com
      port: process.env.MAIL_PORT, //587
      // secure: false, // Use SSL
      auth: {
        user: process.env.MAIL_FROM_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    var sendpassword = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: data.emailAddress,
      subject: "Box App",
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title></title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;1,700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0;font-family: 'Poppins', sans-serif;">
        <div style="background-color:#e2f9ff; max-width: 415px; margin: 0 auto; padding: 40px;background-size: cover; background-position: center;border: 4px solid rgba(255, 255, 255, 0.40); box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.12); border-radius: 20px;">
      
          <div style="text-align: center;">
            <img src="${process.env.APP_LOGO}" alt="Logo Image" style="max-width: 100%;">
          </div>
      
          <h2 style="margin-bottom: 40px;margin-top: -10px; font-size: 25px;font-weight: 600;line-height: 0px;color: #000000; text-align:center;">Welcome to AD ANIMA!</h2>
      
          <p style="font-size: 17px; font-weight: 600; color: #3E555B;">Dear ${data.name},</p>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;max-width: 415px;">
            Welcome to AD ANIMA! We are excited to have you on board. Your account was successfully created. Below, you will find your temporary password to log in to our platform:
          </p>
      
          <p style="font-weight: 600; font-size: 20px; line-height: 34px; color: #000000; border-radius: 5px; background: linear-gradient(90deg, #5CCBEA -4.34%, #EFD296 103.9%); padding: 15px; text-align: center;">
            Temporary Password: ${data.password} <span style="display: flex; justify-content: center; font-size: 13px; font-weight: 500; color: #4a4a4a;  margin-top: 9px; line-height: 19px;"></span>
          </p>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;max-width: 415px;">
            Note: Your password is set to expire in 5 days. Please make sure to update it before it expires to avoid any inconvenience.
          </p>
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;max-width: 415px;">
            Please use this temporary password to access your account. For security reasons, we recommend changing this password after your initial login.
          </p>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;max-width: 415px;">
            If you have any questions or need assistance, please don't hesitate to reach out to our support team at
            <a href="#" style="font-weight: 600; color: #000000;">${process.env.MAIL_FROM_ADDRESS}</a>
          </p>
      
          <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #676767;margin: 0 0 15px 0;max-width: 415px;">
            We look forward to serving you and hope you have a great experience with us.
          </p>
      
          <div style="margin-top: 30px;font-weight: 500;font-size: 15px;color: #000000;">
            Thank You,<br> Ad Anima team
          </div>
      
        </div>
      </body>
      </html>`,
    };

    return await transporter.sendMail(sendpassword);
  },
};