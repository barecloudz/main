import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Initialize transporter based on environment
// For production, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS as environment variables
let transporter: nodemailer.Transporter;

// 3-hour token expiration
const TOKEN_EXPIRY = 3 * 60 * 60 * 1000;

// Create reset tokens map that will store tokens in memory
// In a production env, you would store these in a database
const resetTokens = new Map<string, { userId: string, expires: Date }>();

// Initialize email transporter based on environment variables
export function initializeEmailTransport() {
  // Check for production SMTP credentials
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    console.log('Email transport initialized with SMTP credentials');
    return transporter;
  } 
  
  // Fall back to ethereal.email (fake SMTP service for development/testing)
  return setupTestAccount();
}

// Setup test account for development
async function setupTestAccount() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('Email transport initialized with test account');
    console.log('Test email credentials:', {
      user: testAccount.user,
      pass: testAccount.pass,
      preview: 'https://ethereal.email'
    });
    
    return transporter;
  } catch (error) {
    console.error('Failed to create test email account:', error);
    return null;
  }
}

// Generate password reset token
export function generatePasswordToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + TOKEN_EXPIRY);
  
  // Store token in memory map
  resetTokens.set(token, {
    userId,
    expires
  });
  
  return token;
}

// Verify password reset token
export function verifyPasswordToken(token: string): string | null {
  const storedToken = resetTokens.get(token);
  
  if (!storedToken) {
    return null;
  }
  
  if (new Date() > storedToken.expires) {
    resetTokens.delete(token);
    return null;
  }
  
  return storedToken.userId;
}

// Invalidate token after use
export function invalidateToken(token: string): void {
  resetTokens.delete(token);
}

// Send welcome email with password setup link
export async function sendWelcomeEmail(
  email: string, 
  firstName: string,
  userId: string
): Promise<boolean> {
  if (!transporter) {
    await initializeEmailTransport();
  }
  
  if (!transporter) {
    console.error('Failed to initialize email transport');
    return false;
  }
  
  try {
    const token = generatePasswordToken(userId);
    const resetLink = `${process.env.APP_URL || 'http://localhost:5000'}/set-password?token=${token}`;
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"BareCloudz Marketing" <noreply@barecloudz.com>',
      to: email,
      subject: 'Welcome to BareCloudz - Set Up Your Account',
      text: `
        Hello ${firstName},
        
        Welcome to BareCloudz Marketing! We're excited to have you join us.
        
        Please click the link below to set up your password and complete your account registration:
        ${resetLink}
        
        This link will expire in 3 hours.
        
        If you didn't request this email, please ignore it.
        
        Best Regards,
        The BareCloudz Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://barecloudz.com/logo.png" alt="BareCloudz Logo" style="max-width: 150px;">
          </div>
          
          <h2 style="color: #35c677; text-align: center;">Welcome to BareCloudz!</h2>
          
          <p>Hello ${firstName},</p>
          
          <p>We're excited to have you join the BareCloudz client portal. Your account has been created, and you're just one step away from accessing your marketing dashboard.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #35c677; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Set Up Your Password</a>
          </div>
          
          <p>This link will expire in 3 hours for security reasons.</p>
          
          <p>If you didn't request this email, please ignore it.</p>
          
          <p>Best Regards,<br>The BareCloudz Team</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center;">
            <p>© ${new Date().getFullYear()} BareCloudz Marketing. All rights reserved.</p>
            <p>1234 Marketing St, Suite 500, New York, NY 10001</p>
          </div>
        </div>
      `
    });
    
    console.log('Email sent:', info.messageId);
    
    // Log preview URL in development
    if (info.messageId && info.testMessageUrl) {
      console.log('Preview URL:', info.testMessageUrl);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string, 
  firstName: string,
  userId: string
): Promise<boolean> {
  if (!transporter) {
    await initializeEmailTransport();
  }
  
  if (!transporter) {
    console.error('Failed to initialize email transport');
    return false;
  }
  
  try {
    const token = generatePasswordToken(userId);
    const resetLink = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${token}`;
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"BareCloudz Marketing" <noreply@barecloudz.com>',
      to: email,
      subject: 'Reset Your Password - BareCloudz Marketing',
      text: `
        Hello ${firstName},
        
        We received a request to reset your password for your BareCloudz account.
        
        Please click the link below to reset your password:
        ${resetLink}
        
        This link will expire in 3 hours.
        
        If you didn't request this email, please ignore it.
        
        Best Regards,
        The BareCloudz Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://barecloudz.com/logo.png" alt="BareCloudz Logo" style="max-width: 150px;">
          </div>
          
          <h2 style="color: #35c677; text-align: center;">Password Reset Request</h2>
          
          <p>Hello ${firstName},</p>
          
          <p>We received a request to reset your password for your BareCloudz account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #35c677; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Your Password</a>
          </div>
          
          <p>This link will expire in 3 hours for security reasons.</p>
          
          <p>If you didn't request this email, please ignore it – your account is still secure.</p>
          
          <p>Best Regards,<br>The BareCloudz Team</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center;">
            <p>© ${new Date().getFullYear()} BareCloudz Marketing. All rights reserved.</p>
            <p>1234 Marketing St, Suite 500, New York, NY 10001</p>
          </div>
        </div>
      `
    });
    
    console.log('Email sent:', info.messageId);
    
    // Log preview URL in development
    if (info.messageId && info.testMessageUrl) {
      console.log('Preview URL:', info.testMessageUrl);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}