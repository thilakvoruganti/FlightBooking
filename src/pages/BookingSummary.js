import React, { useState, useRef } from 'react'
import '../styles/BookingSummary.css'
import { useLocation, useNavigate } from 'react-router-dom';
import { useFlight } from '../context/Flight'
import { useAuth } from '.././context/Auth'
import axios from 'axios'
import { useEffect } from 'react';

const BookingSummary = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const alertBtn = useRef()

    const { auth } = useAuth()
    const { searchflights, tripFlights, localpassengers, setLocalPassengers } = useFlight()

    const [isPaying, setIsPaying] = useState(false)
    const [paymentError, setPaymentError] = useState('')
    const primaryContacts = localpassengers.filter((element) => element.email)

    useEffect(() => {
        const handler = () => {
            window.history.pushState({}, '', location.pathname);
            alertBtn.current.click();
        };
        window.addEventListener('popstate', handler);
        return () => {
            window.removeEventListener('popstate', handler);
        };
    }, [location.pathname, alertBtn]);

    // const alertBtn = useRef()

    // const [isBSBackButtonClicked, setIsBSBackButtonClicked] = useState(false)

    // const onBSBackButtonEvent = (e) => {
    //     e.preventDefault();
    //     if(!isBSBackButtonClicked){
    //         let sf = JSON.parse(localStorage.getItem('searchflights'))
    //         if(sf[2].tripValue === 'One-way'){
    //             updateSearchFlights(3,moment(sf[3]))
    //             setIsBSBackButtonClicked(true)
    //             navigate('/')
    //         }
    //             if(sf[2].tripValue === 'Return'){
    //             let startDate = moment(sf[4].startDate)
    //             let endDate = moment(sf[4].endDate)
    //             updateSearchFlights(4,{startDate,endDate})
    //             setIsBSBackButtonClicked(true)
    //             navigate('/')
    //         }   
    //         navigate('/')
    //     }
    // }   




    const totalPrice = () => {
        if (searchflights[5].passengerClass === 'Economy') {
            if (searchflights[2].tripValue === 'One-way') {
                return tripFlights[0].economyprice * (searchflights[5].passengerCount - searchflights[5].infantCount)
            }
            if (searchflights[2].tripValue === 'Return') {
                return (tripFlights[0].economyprice + tripFlights[1].economyprice) * (searchflights[5].passengerCount - searchflights[5].infantCount)
            }
        }
        if (searchflights[5].passengerClass === 'Premium') {
            if (searchflights[2].tripValue === 'One-way') {
                return tripFlights[0].premiumprice * (searchflights[5].passengerCount - searchflights[5].infantCount)
            }
            if (searchflights[2].tripValue === 'Return') {
                return (tripFlights[0].premiumprice + tripFlights[1].premiumprice) * (searchflights[5].passengerCount - searchflights[5].infantCount)
            }
        }
    }

    const passengerTypeLabel = `${searchflights[5].adultCount ? `${searchflights[5].adultCount} Adult` : ''}${searchflights[5].childCount ? ` + ${searchflights[5].childCount} Child` : ''}${searchflights[5].infantCount ? ` + ${searchflights[5].infantCount} Infant` : ''}`.trim()
    const bookandpay = async () => {
        if (!auth?.token || isPaying) return
        setIsPaying(true)
        setPaymentError('')
        try {
            const { data } = await axios.post(`/auth/bookflight`, {
                triptype: searchflights[2].tripValue,
                tripclass: searchflights[5].passengerClass,
                totalprice: totalPrice(),
                flightname: tripFlights[0].flightname,
                flightnumber: tripFlights[0].flightnumber,
                departure: tripFlights[0].departure,
                departuretime: tripFlights[0].departuretime,
                departuredate: searchflights[2].tripValue === 'Return' ? searchflights[4].departuredate : searchflights[3].departuredate,
                departureairport: tripFlights[0].departureairport,
                departurecode: tripFlights[0].departurecode,
                destination: tripFlights[0].destination,
                destinationtime: tripFlights[0].destinationtime,
                destinationairport: tripFlights[0].destinationairport,
                destinationcode: tripFlights[0].destinationcode,
                rflightname: tripFlights[1].flightname,
                rflightnumber: tripFlights[1].flightnumber,
                rdeparture: tripFlights[1].departure,
                rdeparturetime: tripFlights[1].departuretime,
                rdeparturedate: searchflights[4].destinationdate,
                rdepartureairport: tripFlights[1].departureairport,
                rdeparturecode: tripFlights[1].departurecode,
                rdestination: tripFlights[1].destination,
                rdestinationtime: tripFlights[1].destinationtime,
                rdestinationairport: tripFlights[1].destinationairport,
                rdestinationcode: tripFlights[1].destinationcode
            })
            const booked = data
            if (!booked?.success || !booked?.booking?._id) {
                setPaymentError('Unable to create booking. Please try again.')
                setIsPaying(false)
                return
            }

            let allPassengersSaved = true
            let passengerSaveError = ''
            for (let i = 0; i < localpassengers.length; i++) {
                const response = await axios.post(`/auth/createpassenger`, {
                        firstname: localpassengers[i].firstname,
                        lastname: localpassengers[i].lastname,
                        gender: localpassengers[i].gender,
                        nationality: localpassengers[i].nationality,
                        dateofbirth: localpassengers[i].dateofbirth,
                        passport: localpassengers[i].passport,
                        passportexpirydate: localpassengers[i].passportexpirydate,
                        mobilenumber: localpassengers[i].mobilenumber,
                        email: localpassengers[i].email,
                        bookingid: booked.booking._id
                    })
                if (!response?.data?.success) {
                    allPassengersSaved = false
                    passengerSaveError = response?.data?.msg || 'Passenger details could not be saved.'
                    break
                }
            }

            if (!allPassengersSaved) {
                setPaymentError(passengerSaveError || 'Passenger details could not be saved. Please review details and try again.')
                setIsPaying(false)
                return
            }

            const paymentSession = await axios.post('/auth/payments/create-checkout-session', {
                bookingId: booked.booking._id,
            })
            const checkoutUrl = paymentSession?.data?.url
            if (!checkoutUrl) {
                setPaymentError('Unable to open payment page. Please try again.')
                setIsPaying(false)
                return
            }

            window.location.assign(checkoutUrl)
        } catch (error) {
            setPaymentError('Unable to initiate payment. Please verify Stripe setup and try again.')
            setIsPaying(false)
        }
    }

    return (
        <div className='book-sum-con'>
            <div className='bsc-title'>Trip Summary</div>
            <div className='fpc-con'>
                <div className='ts-body'>
                    {tripFlights.slice(0, searchflights[2].tripValue === 'Return' ? tripFlights.length : 1).map((flight, i) => {
                        const tripDate = i === 1
                            ? searchflights[4].destinationdate
                            : searchflights[2].tripValue === 'Return'
                                ? searchflights[4].departuredate
                                : searchflights[3].departuredate

                        return <div className='fd-con' key={`${flight._id || flight.flightnumber}-${i}`}>
                            <div className='ts-t-m'>{i === 0 ? "Outbound flight" : "Inbound flight"}</div>
                            <div className='fd-con-header'>
                                <div className='ts-i-xl'>{flight.departure}</div>
                                <div className='ts-arrow'>&#8594;</div>
                                <div className='ts-i-xl'>{flight.destination}</div>
                                <div className='ts-i-m ts-t-m-p'>{tripDate}</div>
                            </div>
                            <div className='fd-con-body'>
                                <div className='fd-col'>
                                    <div className='ts-i-m table-h'>Departure</div>
                                    <div className='ts-i-l-b'>{flight.departuretime} {flight.departurecode}</div>
                                    <div className='ts-i-m'>{flight.departure}, {flight.departureairport}</div>
                                </div>
                                <div className='fd-col fd-col-center'>
                                    <div className='ts-i-m table-h'>Duration</div>
                                    <div className='ts-i-l'>Non-stop</div>
                                </div>
                                <div className='fd-col'>
                                    <div className='ts-i-m table-h'>Arrival</div>
                                    <div className='ts-i-l-b'>{flight.destinationtime} {flight.destinationcode}</div>
                                    <div className='ts-i-m'>{flight.destination}, {flight.destinationairport}</div>
                                </div>
                                <div className='fd-col'>
                                    <div className='ts-i-m table-h'>Operated by</div>
                                    <div className='ts-i-l'>{flight.flightname}</div>
                                </div>
                                <div className='fd-col'>
                                    <div className='ts-i-m table-h'>Class</div>
                                    <div className='ts-i-l'>{searchflights[5].passengerClass}</div>
                                </div>
                            </div>
                        </div>
                    })}
                    <div className='ts-i-xl ts-i-h-p'>Passenger Details</div>
                    <div className='pd-con'>
                        <div className='summary-grid-head'>
                            <div className='ts-i-m table-h'>Passenger name</div>
                            <div className='ts-i-m table-h'>Passport</div>
                            <div className='ts-i-m table-h'>Date of birth</div>
                            <div className='ts-i-m table-h'>Type</div>
                        </div>
                        {localpassengers.map((element, index) => {
                            const { firstname, lastname, passport, dateofbirth, type } = element
                            return <div className='summary-grid-row' key={`${firstname}-${lastname}-${index}`}>
                                <div className='ts-i-l table-d' data-label='Passenger name'>{firstname + ' ' + lastname}</div>
                                <div className='ts-i-l table-d' data-label='Passport'>{passport ? passport : '-'}</div>
                                <div className='ts-i-l table-d' data-label='Date of birth'>{dateofbirth}</div>
                                <div className='ts-i-l table-d' data-label='Type'>{type}</div>
                            </div>
                        })}
                    </div>
                    <div className='ts-i-xl ts-i-h-p'>Contact Details</div>
                    <div className='cd-con'>
                        <div className='summary-grid-head'>
                            <div className='ts-i-m table-h'>Passenger name</div>
                            <div className='ts-i-m table-h'>Type</div>
                            <div className='ts-i-m table-h'>Email</div>
                            <div className='ts-i-m table-h'>Number</div>
                        </div>
                        {primaryContacts.map((element, index) => (
                            <div className='summary-grid-row' key={`contact-${element.firstname}-${index}`}>
                                <div className='ts-i-l' data-label='Passenger name'>{element.firstname + ' ' + element.lastname}</div>
                                <div className='ts-i-l' data-label='Type'>Primary</div>
                                <div className='ts-i-l' data-label='Email'>{element.email}</div>
                                <div className='ts-i-l' data-label='Number'>{element.mobilenumber}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className='bsc-title'>Total price</div>
            <div className='ts-footer'>
                <div className='d-flex justify-content-between'>
                    <div className='ts-i-m'>Trip price</div>
                    <div className='ts-i-m'>USD {totalPrice()}</div>
                </div>
                <div className='ts-i-m'>&#40;{passengerTypeLabel}&#41;</div>
                <div className='pa-con'>
                    <div className='ts-i-l-b'>Payable Amount:</div>
                    <div className='ts-i-l-b'>USD {totalPrice()}</div>
                </div>
            </div>
            <div className='payment-test-note' role='note'>
                <div className='payment-test-note-title'>Test Payment (Stripe Sandbox)</div>
                <div className='payment-test-note-body'>
                    Use card <code>4242 4242 4242 4242</code>, any future expiry, any 3-digit CVC, and any ZIP code.
                </div>
            </div>
            <div className='d-flex justify-content-around'>
                <button onClick={bookandpay} className='prcd-btn' disabled={isPaying}>{isPaying ? 'Redirecting to Stripe...' : 'Book and Pay'}</button>
            </div>
            {paymentError ? <div className='payment-error-msg'>{paymentError}</div> : null}
            {/* <!-- Button trigger modal --> */}
            <button type="button" ref={alertBtn} className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#modifyBooking">
                Launch demo modal
            </button>

            {/* <!-- Modal --> */}
            <div className="modal fade " id="modifyBooking" tabIndex="-1" aria-labelledby="modifyBookingLabel" aria-hidden="true">
                <div className="modal-dialog modifyalert">
                    <div className="modal-content">
                        <div className="modal-header ma-header">
                            <h1 className="modal-title fs-5" id="modifyBookingLabel">Confirm Booking Change</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body ma-body">
                            Are you sure you want to modify your booking
                        </div>
                        <div className="modal-footer ma-footer">
                            <button type="button" className="ma-btn" data-bs-dismiss="modal">Continue</button>
                            <button type="button" onClick={()=> {
                                localStorage.removeItem('passengersdata')
                                setLocalPassengers([])
                                navigate('/')
                                }} className="ma-btn">Modify booking</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingSummary






            // if(booked.success !== true){
            //     setBookingStatus(true)
            // }
            // if(booked.success && !bookingstatus){
            //     localStorage.setItem('BookingID',booked.booking._id)
            // }
            // localStorage.setItem('bookingstatus',bookingstatus)
            // navigate('/dashboard/confirmation')
            // else{
            //     const response = await fetch(`${host}/api/v1/bookflight`,{
            //         method:'POST',
            //         headers:{
            //             'Content-type':'application/json',
            //         },
            //         body: JSON.stringify({
            //                         triptype: searchflights[2].tripValue,
            //                         tripclass: searchflights[5].passengerClass,
            //                         totalprice: totalPrice(),
            //                         flightname:tripFlights[0].flightname,
            //                         flightnumber:tripFlights[0].flightnumber,
            //                         departure: tripFlights[0].departure,
            //                         departuretime:tripFlights[0].departuretime,
            //                         departuredate: searchdate.slice(0,11),
            //                         departureairport:tripFlights[0].departureairport,
            //                         departurecode:tripFlights[0].departurecode,
            //                         destination:tripFlights[0].destination,
            //                         destinationtime:tripFlights[0].destinationtime,
            //                         destinationairport:tripFlights[0].destinationairport,
            //                         destinationcode:tripFlights[0].destinationcode,
            //                         rflightname:tripFlights[1].flightname,
            //                         rflightnumber:tripFlights[1].flightnumber,
            //                         rdeparture:tripFlights[1].departure,
            //                         rdeparturetime:tripFlights[1].departuretime,
            //                         rdeparturedate:searchdate.slice(14,25),
            //                         rdepartureairport:tripFlights[1].departureairport,
            //                         rdeparturecode:tripFlights[1].departurecode,
            //                         rdestination:tripFlights[1].destination,
            //                         rdestinationtime:tripFlights[1].destinationtime,
            //                         rdestinationairport:tripFlights[1].destinationairport,
            //                         rdestinationcode:tripFlights[1].destinationcode
            //             })
            //     })
            //     const booked = await response.json()
            //     console.log(booked.success)
            //     if(booked.success){
            //         for (var i=0;i<localpassengers.length;i++){
            //             const psopt = []
            //             let bookpass = await fetch(`${host}/api/v1/createpassenger`,{
            //             method:'POST',
            //             headers:{
            //                 'Content-type':'application/json',
            //             },
            //             body: JSON.stringify({
            //                         firstname:localpassengers[i].firstname,
            //                         lastname:localpassengers[i].lastname,
            //                         gender:localpassengers[i].gender,
            //                         nationality:localpassengers[i].nationality,
            //                         passport:localpassengers[i].passport,
            //                         passportexpirydate:localpassengers[i].passportexpirydate,
            //                         mobilenumber:localpassengers[i].mobilenumber,
            //                         email:localpassengers[i].email,
            //                         bookingid:booked.booking._id
            //                 })
            //             })
            //             psopt[i] = await bookpass.json()
            //             if(psopt[i].passenger.success !== true){
            //                 console.log(psopt[i].passenger.success)
            //                 setBookingStatus(true)
            //             }
            //         }
            //     }
            //     else{
            //         setBookingStatus(true)
            //     }
            //     if(booked.success && !bookingstatus){
            //         localStorage.setItem('BookingID',booked.booking._id)
            //     }
            //     localStorage.removeItem('bookingstatus')
            //     localStorage.setItem('bookingstatus',bookingstatus)
            //     navigate('/confirmation')
            // }
