/**
 * Email Service for Goddess Hair & Beauty
 * Handles sending notifications for sales confirmations and yoga bookings
 */

import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

interface SaleConfirmationData {
  orderId: string
  customerName: string
  customerEmail: string
  items: Array<{
    name: string
    price: number
    quantity: number
  }>
  total: number
  paymentMethod: string
  shippingAddress?: string
}

interface YogaBookingData {
  bookingId: string
  customerName: string
  customerEmail: string
  phone?: string
  service: string
  date: string
  time: string
  addOns?: string[]
  specialRequests?: string
  totalPrice: number
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private businessEmail: string

  constructor() {
    this.businessEmail = process.env.BUSINESS_EMAIL || 'goddesshairandbodycare@gmail.com'
    this.initializeTransporter()
  }

  private initializeTransporter() {
    try {
      const config: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASSWORD || ''
        }
      }

      this.transporter = nodemailer.createTransporter(config)
    } catch (error) {
      console.error('Failed to initialize email transporter:', error)
    }
  }

  private async sendEmail(emailData: EmailData): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized')
      return false
    }

    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Goddess Hair & Beauty'} <${process.env.EMAIL_FROM_ADDRESS || this.businessEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  /**
   * Send sale confirmation to business email
   */
  async sendSaleConfirmation(saleData: SaleConfirmationData): Promise<boolean> {
    const subject = `🛍️ New Sale Confirmation - Order #${saleData.orderId}`
    
    const itemsList = saleData.items.map(item => 
      `<li>${item.name} - Qty: ${item.quantity} - $${item.price.toFixed(2)}</li>`
    ).join('')

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B5CF6, #A855F7); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Sale Confirmation</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Order Details</h2>
          <p><strong>Order ID:</strong> ${saleData.orderId}</p>
          <p><strong>Customer:</strong> ${saleData.customerName}</p>
          <p><strong>Email:</strong> ${saleData.customerEmail}</p>
          <p><strong>Payment Method:</strong> ${saleData.paymentMethod}</p>
          
          ${saleData.shippingAddress ? `<p><strong>Shipping Address:</strong><br>${saleData.shippingAddress}</p>` : ''}
          
          <h3 style="color: #333;">Items Purchased</h3>
          <ul style="background: white; padding: 15px; border-radius: 5px;">
            ${itemsList}
          </ul>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 15px;">
            <h3 style="color: #333; margin: 0;">Total: $${saleData.total.toFixed(2)}</h3>
          </div>
          
          <p style="margin-top: 20px; color: #666;">
            This is an automated notification. Please process this order and send confirmation to the customer.
          </p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: this.businessEmail,
      subject,
      html
    })
  }

  /**
   * Send yoga booking confirmation to business email
   */
  async sendYogaBookingNotification(bookingData: YogaBookingData): Promise<boolean> {
    const subject = `🧘‍♀️ New Yoga Booking - ${bookingData.service}`
    
    const addOnsList = bookingData.addOns && bookingData.addOns.length > 0 
      ? `<p><strong>Add-ons:</strong> ${bookingData.addOns.join(', ')}</p>`
      : ''

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Yoga Booking</h1>
        </div>
        
        <div style="padding: 20px; background: #f0f9ff;">
          <h2 style="color: #333;">Booking Details</h2>
          <p><strong>Booking ID:</strong> ${bookingData.bookingId}</p>
          <p><strong>Service:</strong> ${bookingData.service}</p>
          <p><strong>Date & Time:</strong> ${bookingData.date} at ${bookingData.time}</p>
          
          <h3 style="color: #333;">Customer Information</h3>
          <div style="background: white; padding: 15px; border-radius: 5px;">
            <p><strong>Name:</strong> ${bookingData.customerName}</p>
            <p><strong>Email:</strong> ${bookingData.customerEmail}</p>
            ${bookingData.phone ? `<p><strong>Phone:</strong> ${bookingData.phone}</p>` : ''}
          </div>
          
          ${addOnsList}
          
          ${bookingData.specialRequests ? `
            <h3 style="color: #333;">Special Requests</h3>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <p>${bookingData.specialRequests}</p>
            </div>
          ` : ''}
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 15px;">
            <h3 style="color: #333; margin: 0;">Total Price: $${bookingData.totalPrice.toFixed(2)}</h3>
          </div>
          
          <p style="margin-top: 20px; color: #666;">
            Please confirm this booking with the customer and prepare for the session.
          </p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: this.businessEmail,
      subject,
      html
    })
  }

  /**
   * Send customer confirmation email
   */
  async sendCustomerConfirmation(type: 'sale' | 'yoga', customerEmail: string, data: any): Promise<boolean> {
    if (type === 'sale') {
      return this.sendSaleCustomerConfirmation(customerEmail, data)
    } else {
      return this.sendYogaCustomerConfirmation(customerEmail, data)
    }
  }

  private async sendSaleCustomerConfirmation(customerEmail: string, saleData: SaleConfirmationData): Promise<boolean> {
    const subject = `Order Confirmation - Goddess Hair & Beauty #${saleData.orderId}`
    
    const itemsList = saleData.items.map(item => 
      `<li style="padding: 5px 0;">${item.name} - Qty: ${item.quantity} - $${item.price.toFixed(2)}</li>`
    ).join('')

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B5CF6, #A855F7); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Thank You for Your Order!</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${saleData.customerName},</p>
          <p>Thank you for your purchase! We've received your order and will process it shortly.</p>
          
          <h3 style="color: #333;">Order Summary</h3>
          <p><strong>Order ID:</strong> ${saleData.orderId}</p>
          
          <ul style="background: #f9f9f9; padding: 15px; border-radius: 5px; list-style: none;">
            ${itemsList}
          </ul>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin-top: 15px; text-align: center;">
            <h3 style="color: #333; margin: 0;">Total: $${saleData.total.toFixed(2)}</h3>
          </div>
          
          <p style="margin-top: 20px;">
            We'll send you a shipping confirmation once your order is on its way.
          </p>
          
          <p>
            If you have any questions, please contact us at ${this.businessEmail}
          </p>
          
          <p>
            With love,<br>
            <strong>Goddess Hair & Beauty Team</strong>
          </p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: customerEmail,
      subject,
      html
    })
  }

  private async sendYogaCustomerConfirmation(customerEmail: string, bookingData: YogaBookingData): Promise<boolean> {
    const subject = `Yoga Booking Confirmed - ${bookingData.service}`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Confirmed! 🧘‍♀️</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${bookingData.customerName},</p>
          <p>Your yoga session has been confirmed! We're excited to see you.</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Session Details</h3>
            <p><strong>Service:</strong> ${bookingData.service}</p>
            <p><strong>Date:</strong> ${bookingData.date}</p>
            <p><strong>Time:</strong> ${bookingData.time}</p>
            <p><strong>Booking ID:</strong> ${bookingData.bookingId}</p>
            ${bookingData.addOns && bookingData.addOns.length > 0 ? `<p><strong>Add-ons:</strong> ${bookingData.addOns.join(', ')}</p>` : ''}
          </div>
          
          <h3 style="color: #333;">What to Bring</h3>
          <ul>
            <li>Comfortable yoga attire</li>
            <li>Water bottle</li>
            <li>Yoga mat (or we can provide one)</li>
            <li>Open mind and positive energy ✨</li>
          </ul>
          
          <p style="background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
            <strong>Please arrive 10 minutes early</strong> to get settled and prepare for your session.
          </p>
          
          <p>
            If you need to reschedule or have any questions, please contact us at ${this.businessEmail}
          </p>
          
          <p>
            Namaste,<br>
            <strong>Goddess Hair & Beauty Team</strong>
          </p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: customerEmail,
      subject,
      html
    })
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<boolean> {
    const testSubject = 'Email Configuration Test - Goddess Hair & Beauty'
    const testHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify that your email configuration is working correctly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p>If you receive this email, your email service is configured properly!</p>
      </div>
    `

    return this.sendEmail({
      to: this.businessEmail,
      subject: testSubject,
      html: testHtml
    })
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Export types for use in other files
export type { SaleConfirmationData, YogaBookingData }