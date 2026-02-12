import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import flightContent from "../context/FlightContext";
import '../styles/FetchBooking.css'
import Button from '../components/Button'
import { useFlight } from '../context/Flight'


const FetchBooking = () => {
    useContext(flightContent)

    const { createPdf, getPdf } = useFlight()


    const [fetchbooking, setFetchBooking] = useState([])
    const [fetchpassenger, setFetchPassenger] = useState([])

    const viewBooking = async (bid) => {
        const { data } = await axios.get(`/auth/myflight?_id=${bid}`)
        const fdata = data
        if (fdata.success) {
            setFetchBooking(fdata.flights)
            const { data } = await axios.get(`auth/getpassofbook?_id=${bid}`)
            const pdata = data
            if (pdata.success) {
                setFetchPassenger(pdata.passenger)
            }
        }
    }
    const params = useParams()
    useEffect(() => {
        viewBooking(params.slug)
    }, [])
    const download = async (bid) => {
        const { data } = await axios(`/myflight?_id=${bid}`);
        const pbdata = data
        if (pbdata.success) {
            const { data } = await axios(`/getpassofbook?_id=${bid}`)
            const bpdata = data
            console.log(bpdata)
            if (bpdata.success) {
                const pdfResponse = await createPdf(bid, bpdata.passenger, pbdata.flights)
                if (pdfResponse?.success) {
                    await getPdf(pdfResponse.fileName)
                }
            }
        }
    }

    return (
        <div>
            <div className='fetch-flight-con'>
                <div className='ff-title'>Booking Details</div>
                <div>
                    {fetchbooking.map((element) => {
                        return <React.Fragment key={element._id}>
                            <div className='ff-body-con'>
                                <div className='ff-bl-con'>
                                    <div className='bf-con'>
                                        <div className='ff-bc-item'>
                                            <div className='bf-con-head'>
                                                <div className='d-flex justify-content-between'>
                                                    <div className='ffc-m-item'>Outbound flight</div>
                                                    <div className='ffc-m-item'>{element.departuredate}</div>
                                                </div>
                                                <div className='ffc-m-b-item'>{element.flightname} {element.flightnumber}</div>
                                            </div>
                                            <div className='bf-con-body'>
                                                <div>
                                                    <div className='ffc-s-item'>DEPARTURE</div>
                                                    <div className='ffc-l-item'>{element.departurecode}-{element.departuretime}</div>
                                                    <div className='ffc-m-b-item'>{element.departuredate}</div>
                                                    <div className='ffc-m-item'>{element.departure}</div>
                                                    <div className='ffc-m-item'>{element.departureairport}</div>
                                                </div>
                                                <div className='dgc-item'>
                                                    <div className='ffc-s-item'>DURATION</div>
                                                    <div className='ffc-l-item'>3hr</div>
                                                </div>
                                                <div>
                                                    <div className='ffc-s-item'>ARRIVAL</div>
                                                    <div className='ffc-l-item'>{element.destinationcode}-{element.destinationtime}</div>
                                                    <div className='ffc-m-b-item'>{element.departuredate}</div>
                                                    <div className='ffc-m-item'>{element.destination}</div>
                                                    <div className='ffc-m-item'>{element.destinationairport}</div>
                                                </div>
                                            </div>
                                        </div>
                                        {element.triptype === 'Return' ?
                                            <div className='ff-bc-item'>
                                                <div className='bf-con-head'>
                                                    <div className='d-flex justify-content-between'>
                                                        <div className='ffc-m-item'>Inbound flight</div>
                                                        <div className='ffc-m-item'>{element.rdeparturedate}</div>
                                                    </div>
                                                    <div className='ffc-m-b-item'>{element.rflightname} {element.rflightnumber}</div>
                                                </div>
                                                <div className='bf-con-body'>
                                                    <div>
                                                        <div className='ffc-s-item'>DEPARTURE</div>
                                                        <div className='ffc-l-item'>{element.rdeparturecode}-{element.rdeparturetime}</div>
                                                        <div className='ffc-m-b-item'>{element.rdeparturedate}</div>
                                                        <div className='ffc-m-item'>{element.rdeparture}</div>
                                                        <div className='ffc-m-item'>{element.rdepartureairport}</div>
                                                    </div>
                                                    <div className='dgc-item'>
                                                        <div className='ffc-s-item'>DURATION</div>
                                                        <div className='ffc-l-item'>3hr</div>
                                                    </div>
                                                    <div>
                                                        <div className='ffc-s-item'>ARRIVAL</div>
                                                        <div className='ffc-l-item'>{element.rdestinationcode}-{element.rdestinationtime}</div>
                                                        <div className='ffc-m-b-item'>{element.rdeparturedate}</div>
                                                        <div className='ffc-m-item'>{element.rdestination}</div>
                                                        <div className='ffc-m-item'>{element.rdestinationairport}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            <></>
                                        }
                                    </div>
                                    <div className='ff-title'>Passenger Details</div>
                                    <div className='bpd-con'>
                                        <div className='d-g'>
                                            <div className='ffc-s-item'>PASSENGER</div>
                                            <div className='ffc-s-item '>TYPE</div>
                                            <div className='ffc-s-item '>PHONE</div>
                                            <div className='ffc-s-item '>EMAIL</div>
                                        </div>
                                        {fetchpassenger.map((element) => {
                                            return <React.Fragment key={`${element._id || element.passport}-${element.firstname}`}>
                                                <div className='d-g'>
                                                    <div>{element.firstname} {element.lastname}</div>
                                                    <div className=''>Adult</div>
                                                    <div>{element.mobilenumber ? element.mobilenumber : '-'}</div>
                                                    <div>{element.email ? element.email : '-'}</div>
                                                </div>
                                            </React.Fragment>
                                        })
                                        }
                                    </div>
                                    <div className='ff-title'>Payment Details</div>
                                    <div className='bp-con'>
                                        <div className='d-flex justify-content-between'>
                                            <div>Base fare</div>
                                            <div>{element.totalprice}</div>
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <div>Amount Paid</div>
                                            <div>{element.totalprice}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className='ff-br-con'>
                                    <div className='bs-con'>
                                        <div className='bs-con-div'>
                                            <div className='ffc-s-item'>BOOKING ID</div>
                                            <div className='ffc-m-item'>{element._id}</div>
                                        </div>
                                        <div className='bs-con-div'>
                                            <div className='ffc-s-item'>CLASS</div>
                                            <div className='ffc-m-item'>{element.tripclass || 'Economy'}</div>
                                        </div>
                                        <div className='bs-con-div'>
                                            <div className='ffc-s-item'>BOOKING STATUS</div>
                                            <div className='ffc-m-item'>Booking Confirmed</div>
                                        </div>
                                    </div>
                                    <div className='d-flex justify-content-center'>
                                        <Button type='download' onClick={() => download(element._id)}>Download <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="dwd-logo bi bi-download" viewBox="0 0 16 16">
                                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                                            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                                        </svg></Button>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    }
                    )
                    }
                </div>
            </div>
        </div>
    )
}

export default FetchBooking
