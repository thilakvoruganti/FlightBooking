import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import '../styles/PaymentStatus.css'

const PaymentCancel = () => {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('booking_id')

  return (
    <div className='payment-status-page'>
      <div className='payment-status-card'>
        <h1 className='payment-status-title'>Payment Canceled</h1>
        <p className='payment-status-text'>
          Payment was canceled. Your booking is saved as unpaid.
        </p>
        {bookingId ? <p className='payment-status-meta'>Booking ID: {bookingId}</p> : null}
        <div className='payment-status-actions'>
          <Link className='payment-status-btn' to='/dashboard'>Go to Dashboard</Link>
          <Link className='payment-status-btn secondary' to='/dashboard/bookingsummary'>Back to Booking Summary</Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancel
