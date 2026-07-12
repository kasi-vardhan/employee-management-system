const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@employeemanagement.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Email templates
const emailTemplates = {
  leaveApproved: (employeeName, leaveType, startDate, endDate) => ({
    subject: 'Leave Request Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Leave Request Approved</h2>
        <p>Dear ${employeeName},</p>
        <p>Your leave request has been <strong>approved</strong>.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> ${new Date(endDate).toLocaleDateString()}</p>
        </div>
        <p>Please ensure you complete any pending tasks before your leave begins.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `,
    text: `Your leave request has been approved. Leave Type: ${leaveType}, From: ${new Date(startDate).toLocaleDateString()}, To: ${new Date(endDate).toLocaleDateString()}`
  }),

  leaveRejected: (employeeName, leaveType, startDate, endDate, reason) => ({
    subject: 'Leave Request Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">Leave Request Rejected</h2>
        <p>Dear ${employeeName},</p>
        <p>Your leave request has been <strong>rejected</strong>.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> ${new Date(endDate).toLocaleDateString()}</p>
          <p><strong>Reason for Rejection:</strong> ${reason || 'No reason provided'}</p>
        </div>
        <p>Please contact HR if you have any questions.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `,
    text: `Your leave request has been rejected. Reason: ${reason || 'No reason provided'}`
  }),

  leavePending: (managerName, employeeName, leaveType, startDate, endDate) => ({
    subject: 'New Leave Request Pending Approval',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F59E0B;">New Leave Request</h2>
        <p>Dear ${managerName},</p>
        <p>A new leave request from <strong>${employeeName}</strong> is pending your approval.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Employee:</strong> ${employeeName}</p>
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> ${new Date(endDate).toLocaleDateString()}</p>
        </div>
        <p>Please review and approve or reject this request in the system.</p>
        <p>Best regards,<br>Employee Management System</p>
      </div>
    `,
    text: `New leave request from ${employeeName} for ${leaveType} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
  }),

  attendanceMarked: (employeeName, date, status, checkIn) => ({
    subject: 'Attendance Marked',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Attendance Record</h2>
        <p>Dear ${employeeName},</p>
        <p>Your attendance has been recorded for <strong>${new Date(date).toLocaleDateString()}</strong>.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${status}</p>
          ${checkIn ? `<p><strong>Check-in Time:</strong> ${checkIn}</p>` : ''}
        </div>
        <p>Keep up the good work!</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `,
    text: `Your attendance for ${new Date(date).toLocaleDateString()} has been marked as ${status}`
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Password Reset</h2>
        <p>Dear ${name},</p>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <div style="margin: 20px 0;">
          <a href="${resetUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Employee Management System</p>
      </div>
    `,
    text: `Reset your password using this link: ${resetUrl}. This link expires in 10 minutes.`
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};
