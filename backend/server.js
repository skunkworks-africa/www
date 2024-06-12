const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Contact form endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, number, message } = req.body;

    // Configure your email transporter (using nodemailer for example)
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com', // replace with your email
            pass: 'your-email-password' // replace with your email password
        }
    });

    let mailOptions = {
        from: 'your-email@gmail.com', // replace with your email
        to: 'info@skunkworks.africa', // replace with the destination email
        subject: 'Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nNumber: ${number}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send('Error sending message');
        }
        res.status(200).send('Message sent successfully');
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
