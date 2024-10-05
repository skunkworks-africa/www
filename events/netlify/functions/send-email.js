const nodemailer = require('nodemailer');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const { name, email } = JSON.parse(event.body);

  // Create a transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your Office 365 email address
      pass: process.env.EMAIL_PASS, // Your Office 365 email password
    },
  });

  // Set up email data
  let mailOptions = {
    from: '"Skunkworks" <info@skunkworks.africa>',
    to: 'info@skunkworks.africa',
    subject: 'Webinar Registration',
    text: `Name: ${name}\nEmail: ${email}`,
    html: `<p>Name: ${name}</p><p>Email: ${email}</p>`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    return {
      statusCode: 200,
      body: 'Registration successful. Thank you!',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `There was an error sending your registration. Error: ${error.message}`,
    };
  }
};