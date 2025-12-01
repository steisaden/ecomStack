import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { type, testData } = await request.json()

    let result = false

    switch (type) {
      case 'configuration':
        result = await emailService.testEmailConfiguration()
        break
        
      case 'sale':
        const saleTestData = {
          orderId: 'TEST-' + Date.now(),
          customerName: 'Test Customer',
          customerEmail: 'test@example.com',
          items: [
            { name: 'Test Product', price: 29.99, quantity: 1 },
            { name: 'Another Product', price: 19.99, quantity: 2 }
          ],
          total: 69.97,
          paymentMethod: 'Credit Card (Test)',
          shippingAddress: '123 Test St, Test City, TC 12345'
        }
        result = await emailService.sendSaleConfirmation(saleTestData)
        break
        
      case 'yoga':
        const yogaTestData = {
          bookingId: 'YOGA-TEST-' + Date.now(),
          customerName: 'Test Yogi',
          customerEmail: 'testyogi@example.com',
          phone: '(555) 123-4567',
          service: 'Hatha Yoga Session',
          date: '2024-12-01',
          time: '10:00 AM',
          addOns: ['Aromatherapy', 'Extended Session'],
          specialRequests: 'Please use lavender essential oil',
          totalPrice: 85.00
        }
        result = await emailService.sendYogaBookingNotification(yogaTestData)
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid test type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result,
      message: result ? 'Test email sent successfully' : 'Failed to send test email'
    })

  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint',
    availableTests: [
      'configuration - Test basic email setup',
      'sale - Test sale confirmation email',
      'yoga - Test yoga booking notification email'
    ],
    usage: 'POST with { "type": "configuration|sale|yoga" }'
  })
}