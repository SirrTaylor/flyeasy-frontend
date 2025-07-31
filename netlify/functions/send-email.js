// netlify/functions/send-email.js

// Import the Nodemailer library.
// You'll need to install this: npm install nodemailer
const nodemailer = require('nodemailer');

// This is the main handler for your Netlify Function.
// It will be triggered when your frontend sends a POST request to it.
exports.handler = async (event, context) => {
    // Ensure the request method is POST.
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405, // Method Not Allowed
            body: JSON.stringify({ message: 'Method Not Allowed. Only POST requests are accepted.' }),
        };
    }

    try {
        // Parse the request body. Assuming the frontend sends JSON.
        // If your form uses application/x-www-form-urlencoded, you might need
        // to parse it differently or adjust your fetch request on the frontend.
        const data = JSON.parse(event.body);

        // Extract form fields. Adjust these keys based on your form's input names.
        // For the detailed form, 'name' comes from 'user-name', 'email' from 'user-email',
        // 'subject' is fixed, and 'message' from 'inquiry-details'.
        // For the simplified form, 'name' from 'user-name', 'email' from 'user-email',
        // 'subject' is fixed, and 'message' is constructed from other fields.
        const { name, email, subject, message } = data;

        // Basic validation: Check if essential fields are present.
        if (!name || !email || !subject || !message) {
            return {
                statusCode: 400, // Bad Request
                body: JSON.stringify({ message: 'Missing required form fields.' }),
            };
        }

        // --- Nodemailer Setup ---
        // Create a Nodemailer transporter using your email service provider's SMTP settings.
        // It's CRUCIAL to use Netlify Environment Variables for your sensitive credentials
        // (process.env.EMAIL_USER and process.env.EMAIL_PASS).
        // DO NOT hardcode them here!
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com' for Gmail, 'smtp.mailgun.org' for Mailgun
            port: parseInt(process.env.SMTP_PORT || '587', 10), // e.g., 587 for TLS, 465 for SSL
            secure: process.env.SMTP_SECURE === 'true', // Use 'true' for 465 (SSL), 'false' for 587 (TLS)
            auth: {
                user: process.env.EMAIL_USER, // Your email address (e.g., your-email@gmail.com)
                pass: process.env.EMAIL_PASS, // Your email password or app-specific password
            },
        });

        // Define the email content.
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address (should match your EMAIL_USER)
            to: process.env.RECIPIENT_EMAIL, // The email address where you want to receive the form data
            subject: `New Contact Form Submission: ${subject}`, // Email subject
            html: `
                <p>You have a new contact form submission from your website.</p>
                <h3>Contact Details:</h3>
                <ul>
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Subject:</strong> ${subject}</li>
                </ul>
                <h3>Message:</h3>
                <p>${message}</p>
            `,
        };

        // Send the email.
        await transporter.sendMail(mailOptions);

        // Return a success response.
        return {
            statusCode: 200, // OK
            body: JSON.stringify({ message: 'Email sent successfully!' }),
        };

    } catch (error) {
        console.error('Error sending email:', error);
        // Return an error response.
        return {
            statusCode: 500, // Internal Server Error
            body: JSON.stringify({ message: 'Failed to send email.', error: error.message }),
        };
    }
};

