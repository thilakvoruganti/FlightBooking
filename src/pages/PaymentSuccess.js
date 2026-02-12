import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import '../styles/PaymentStatus.css'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const sessionId = searchParams.get('session_id')
  const bookingId = searchParams.get('booking_id')

  useEffect(() => {
    const fetchStatus = async () => {
      if (!sessionId) {
        setMessage('Missing session id. Unable to verify payment.')
        setLoading(false)
        return
      }

      try {
        const { data } = await axios.get(`/auth/payments/session-status?session_id=${encodeURIComponent(sessionId)}`)
        if (data.status === 'paid') {
          setMessage('Payment completed successfully. Your booking is confirmed.')
        } else if (data.status === 'pending') {
          setMessage('Payment is still processing. Please refresh in a few seconds.')
        } else {
          setMessage(`Payment status: ${data.status}`)
        }
      } catch (error) {
        setMessage('Unable to verify payment status. Please check your booking from dashboard.')
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [sessionId])

  return (
    <div className='payment-status-page'>
      <div className='payment-status-card'>
        <h1 className='payment-status-title'>Payment Status</h1>
        {loading ? <p className='payment-status-text'>Verifying your payment...</p> : <p className='payment-status-text'>{message}</p>}
        {bookingId ? <p className='payment-status-meta'>Booking ID: {bookingId}</p> : null}
        <div className='payment-status-actions'>
          <Link className='payment-status-btn' to='/dashboard'>Go to Dashboard</Link>
          {bookingId ? <Link className='payment-status-btn secondary' to={`/dashboard/fetchbooking/${bookingId}`}>View Booking</Link> : null}
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
