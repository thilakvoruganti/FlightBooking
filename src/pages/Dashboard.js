import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'
import { useAuth } from '.././context/Auth'
import axios from 'axios';

const getObjectIdTimestamp = (value) => {
    if (!value || typeof value !== 'string' || value.length < 8) return 0
    const timestamp = parseInt(value.substring(0, 8), 16)
    return Number.isFinite(timestamp) ? timestamp * 1000 : 0
}

const parseFlexibleDate = (value) => {
    if (!value || typeof value !== 'string') return NaN
    const normalized = value.replace(/(\d+)(st|nd|rd|th)/gi, '$1')
    const parsed = Date.parse(normalized)
    return Number.isNaN(parsed) ? NaN : parsed
}

const getBookingSortValue = (booking = {}) => {
    const created = Date.parse(booking.createdAt || '')
    if (!Number.isNaN(created)) return created
    const updated = Date.parse(booking.updatedAt || '')
    if (!Number.isNaN(updated)) return updated
    const objectIdDate = getObjectIdTimestamp(booking._id)
    if (objectIdDate) return objectIdDate
    const departure = parseFlexibleDate(booking.departuredate)
    if (!Number.isNaN(departure)) return departure
    return 0
}

const Dashboard = () => {
    const {auth} = useAuth()

    // const content = useContext(flightContent)
    // const { setFetchBooking, setFetchPassenger } = content

    const navigate = useNavigate()


    const [bookings, setBookings] = useState([])
    const [isLoadingBookings, setIsLoadingBookings] = useState(false)
    const [bookingError, setBookingError] = useState('')

    const getBookingsWU = async () => {
        setIsLoadingBookings(true)
        setBookingError('')
        try {
            const { data } = await axios.get('/auth/myflights')
            const flights = Array.isArray(data.flights) ? data.flights : []
            const sortedFlights = [...flights].sort((a, b) => getBookingSortValue(b) - getBookingSortValue(a))
            setBookings(sortedFlights)
        } catch (error) {
            setBookings([])
            setBookingError('We could not load your latest trips. Please try again in a moment.')
        } finally {
            setIsLoadingBookings(false)
        }
    }

    useEffect(() => {
        getBookingsWU()
    }, [])


    return (
        <div>
            <div className='dash-con'>
                <div className='dash-con-title'>Dashboard</div>
                <div className='dash-gret-con'>
                    <div className='dg-head'>Hello, {[auth.user?.firstname, auth.user?.lastname].filter(Boolean).join(' ')}</div>
                    <div className='dg-body'>Welcome back and explore the world</div>
                </div>
                <div className='dash-con-body'>
                    <div className="dash-nav-con nav nav-tabs hc-nav flex-column" id="mydashTab" role="tablist">
                        <div className="nav-item dash-tab-head" role="presentation">
                            <div
                                className="nav-link active dash-nav-item "
                                id="dash-profile-tab"
                                data-bs-toggle="tab"
                                data-bs-target="#dash-profile"
                                role="tab"
                                aria-controls="dash-profile"
                                aria-selected="true">
                                Profile
                            </div>
                        </div>
                        <div className="nav-item dash-tab-head" role="presentation">
                            <div
                                className="nav-link dash-nav-item "
                                id="dash-bookings-tab"
                                data-bs-toggle="tab"
                                data-bs-target="#dash-bookings"
                                role="tab"
                                aria-controls="dash-bookings"
                                aria-selected="false">
                                Bookings
                            </div>
                        </div>
                    </div>
                    <div className="tab-content dash-tab-content" id="mydashTabContent">
                        <div
                            className="dash-tabs tab-pane fade show active"
                            id="dash-profile"
                            role="tabpanel"
                            aria-labelledby="dash-profile-tab">
                            <div className='prof-con'>
                                <div className='prof-con-header'>
                                    <div className='prof-con-title'>Profile</div>
                                    <div className='d-flex'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                        </svg>
                                        <button className='edud-btn d-none'>Update</button>
                                    </div>
                                </div>
                                <div className='prof-con-body'>
                                    <div>Name</div>
                                    <div>: {auth.user?.firstname} {auth.user?.lastname}</div>
                                    <div>Date of birth</div>
                                    <div>: {auth.user?.dateofbirth}</div>
                                    <div>Email</div>
                                    <div>: {auth.user?.email}</div>
                                    <div>Mobile number</div>
                                    <div>: {auth.user?.mobilenumber}</div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="dash-tabs tab-pane fade"
                            id="dash-bookings"
                            role="tabpanel"
                            aria-labelledby="dash-bookings-tab">
                            <div className='bk-con'>
                                <div className='bk-con-title'>Trips</div>
                                <div className='bk-con-filters'>
                                    <div className='bk-con-fi'>Destination</div>
                                    <div className='bk-con-fi'>Date</div>
                                    <div className='bk-con-fi'>People</div>
                                </div>
                                <div className='bk-con-body'>
                                    {isLoadingBookings ? (
                                        <div className='bk-loading-state'>Fetching your trips...</div>
                                    ) : bookings?.length === 0 ? (
                                        <div className='bk-empty-state'>
                                            <div className='bk-empty-icon' aria-hidden="true">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img">
                                                    <path d="M2 13.5c0-.552.448-1 1-1h1.382a1 1 0 0 0 .894-.553l.724-1.447a1 1 0 0 1 .894-.553H9.5l1.618-4.046A1 1 0 0 1 12.06 6h1.88a1 1 0 0 1 .942.664L16 10h3.486a1 1 0 0 1 .96 1.274l-1 3.5a1 1 0 0 1-.96.726H13.5l-.867 3.468A1 1 0 0 1 11.664 19H8a1 1 0 0 1-1-1v-.764l-1.894-1.263A1 1 0 0 1 5 15.132v-1.632L3 13.5z" fill="currentColor" />
                                                </svg>
                                            </div>
                                            <div className='bk-empty-title'>You're cleared for takeoff</div>
                                            <p className='bk-empty-copy'>Plan your first trip to see real-time tracking, payment status, and smooth PDF receipts all in one place.</p>
                                            <button type='button' className='bk-empty-cta' onClick={() => navigate('/')}>Search flights</button>
                                            {bookingError ? <div className='bk-empty-hint'>{bookingError}</div> : null}
                                        </div>
                                    ) : (
                                        bookings?.map((element) => {
                                            return (
                                                <div
                                                    key={element._id}
                                                    className='bk-b-item'
                                                    onClick={() => { navigate(`/dashboard/fetchbooking/${element._id}`) }}
                                                    data-id={element._id}>
                                                    <div className='dd-con'>
                                                        <div className='dd-con-d'>
                                                            <div className='dd-con-d-l'>{element.departurecode}</div>
                                                            <div className='dd-con-d-m'>{element.departure}</div>
                                                        </div>
                                                        <div className='dd-con-f'>
                                                            <div className='dd-con-d-m'>----</div>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="flight-icon bi bi-airplane" viewBox="0 0 16 16">
                                                                <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849Zm.894.448C7.111 2.02 7 2.569 7 3v4a.5.5 0 0 1-.276.447l-5.448 2.724a.5.5 0 0 0-.276.447v.792l5.418-.903a.5.5 0 0 1 .575.41l.5 3a.5.5 0 0 1-.14.437L6.708 15h2.586l-.647-.646a.5.5 0 0 1-.14-.436l.5-3a.5.5 0 0 1 .576-.411L15 11.41v-.792a.5.5 0 0 0-.276-.447L9.276 7.447A.5.5 0 0 1 9 7V3c0-.432-.11-.979-.322-1.401C8.458 1.159 8.213 1 8 1c-.213 0-.458.158-.678.599Z" />
                                                            </svg>
                                                            <div className='dd-con-d-m'>----</div>
                                                        </div>
                                                        <div className='dd-con-d'>
                                                            <div className='dd-con-d-l'>{element.destinationcode}</div>
                                                            <div className='dd-con-d-m'>{element.destination}</div>
                                                        </div>
                                                    </div>
                                                    <div>{element.departuredate || '-'}</div>
                                                    <div>{element.passengercount || '1 Traveler'}</div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
