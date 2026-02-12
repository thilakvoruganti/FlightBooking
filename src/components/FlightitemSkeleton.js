import React from 'react'

const FlightitemSkeleton = () => {
    return (
        <div className='flight-item flight-item-skeleton' aria-hidden='true'>
            <div className='flight-main'>
                <div className='airways-details'>
                    <div className='skeleton-block skeleton-line w-70'></div>
                    <div className='skeleton-block skeleton-line w-45'></div>
                    <div className='skeleton-block skeleton-line w-55'></div>
                </div>
                <div className='td-details'>
                    <div>
                        <div className='skeleton-block skeleton-line w-55'></div>
                        <div className='skeleton-block skeleton-line w-45'></div>
                    </div>
                    <div className='d-flex align-items-center flex-column justify-content-center td-center'>
                        <div className='skeleton-block skeleton-line w-100'></div>
                        <div className='skeleton-block skeleton-line w-60'></div>
                    </div>
                    <div>
                        <div className='skeleton-block skeleton-line w-55'></div>
                        <div className='skeleton-block skeleton-line w-45'></div>
                    </div>
                </div>
                <div className='price-booking-col'>
                    <div className='skeleton-block skeleton-line w-50'></div>
                    <div className='skeleton-block skeleton-btn'></div>
                </div>
                <div className='eco-panel skeleton-eco-panel'>
                    <div className='skeleton-block skeleton-ring'></div>
                    <div className='skeleton-block skeleton-line w-50'></div>
                    <div className='skeleton-block skeleton-line w-70'></div>
                    <div className='skeleton-block skeleton-line w-80'></div>
                </div>
            </div>
        </div>
    )
}

export default FlightitemSkeleton
