import React from 'react'
import '../styles/Confirmationpage.css'
import { Link, useParams } from 'react-router-dom';
import { useFlight } from '../context/Flight'
import axios from 'axios'
import { useEffect } from 'react';
import { useState } from 'react';


const Confirmationpage = () => {

  const {  createPdf, getPdf  } = useFlight()
  
  const params = useParams()

  const download = async() => {
        const {data} = await axios.get(`/myflight?_id=${localStorage.getItem('BookingID')}`);
        const pbdata = data
        if(pbdata.success){
            const {data} = await axios.get(`/getpassofbook?_id=${localStorage.getItem('BookingID')}`)
            const bpdata = data
            if(bpdata.success){
                const pdfResponse = await createPdf(localStorage.getItem('BookingID'), bpdata.passenger, pbdata.flights)
                if (pdfResponse?.success) {
                  await getPdf(pdfResponse.fileName)
                }
            }
    }
  }

  const[status,setStatus] = useState('')
  const[bookingid,setBookingID] = useState('')

  useEffect(()=>{

    let sdata = params.slug.split('&')
    setStatus(sdata[0])
    setBookingID(sdata[1])


  },[])
  return (
    <div className='d-flex justify-content-around'>
    {status === 'success'?
          <div className='cp-con'>
            <div className='cp-alert-con cp-alert-sucesss-con'>
                <div className='cp-status-con'>Your Booking was successfull</div>
                <div className='cp-dad-con'>
                  <div className='bid-con'>
                    <div className='bid-l'>BOOKING ID: </div>
                    <div className='bid-r'>{bookingid}</div>
                  </div>
                  <div className='btn-con'>
                      <button className='cp-btn' onClick={download}>Download Booking</button>
                      <Link to='/dashboard' className='cp-btn' >My Bookings</Link>
                  </div>
                </div>
            </div>
          </div>
          :
          <div className='cp-con'>
            <div className='cp-alert-con cp-alert-sucesss-con'>
                <div className='cp-status-con'>Your Booking was unsuccessfull</div>
                <div className='cp-dad-con'>
                  <div className='bid-con'>
                    <div className='bid-l'>BOOKING ID: </div>
                    <div className='bid-r'>{bookingid}</div>
                  </div>
                  {/* <div className='btn-con'>
                      <button className='cp-btn' onClick={download}>Download Booking</button>
                      {localStorage.getItem('token')?<Link to='/dashboard' className='cp-btn' >My Bookings</Link>:<></>}
                  </div> */}
                </div>
            </div>
          </div>
        }
      </div>
  )
}

export default Confirmationpage
