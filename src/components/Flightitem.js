import React from 'react'
import { useFlight } from '../context/Flight'

const Flightitem = ({flight,onChange, routeAverageCo2, minCo2}) => {
    const ecoLevelLabel = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        unknown: 'Unknown',
    }
    const { searchflights} = useFlight()
    const ecoLevel = (flight.ecolevel || 'unknown').toLowerCase()
    const payingPassengers = searchflights[5].passengerCount - searchflights[5].infantCount
    const baseFare = searchflights[5].passengerClass === 'Economy' ? flight.economyprice : flight.premiumprice
    const totalFare = (typeof baseFare === 'number' ? baseFare : 0) * payingPassengers
    const co2Value = Number(flight.co2kg)
    const routeAverage = Number(routeAverageCo2)
    const routeBest = Number(minCo2)
    const hasCo2 = Number.isFinite(co2Value) && co2Value > 0
    const hasRouteAverage = Number.isFinite(routeAverage) && routeAverage > 0
    const co2DeltaPercent = hasCo2 && hasRouteAverage
        ? ((co2Value - routeAverage) / routeAverage) * 100
        : null
    const stopsPenalty = typeof flight.stops === 'number' ? flight.stops * 5 : 0
    const scoreFromCo2 = hasCo2 && hasRouteAverage
        ? 72 - Math.max(-24, Math.min(34, co2DeltaPercent)) - stopsPenalty
        : null
    const ecoScoreFallback = {
        low: 86,
        medium: 64,
        high: 42,
        unknown: 55,
    }
    const ecoScore = Math.max(
        20,
        Math.min(98, Math.round(scoreFromCo2 ?? ecoScoreFallback[ecoLevel] ?? 55))
    )
    const roundedDelta = co2DeltaPercent === null ? null : Math.round(Math.abs(co2DeltaPercent))
    const ecoComparisonText = !hasCo2
        ? 'CO2 estimate unavailable for this option'
        : !hasRouteAverage
            ? 'Route baseline unavailable'
            : Math.abs(co2DeltaPercent) < 2
                ? 'About the same CO2 as route average'
                : co2DeltaPercent < 0
                    ? `${roundedDelta}% less CO2 than route average`
                    : `${roundedDelta}% more CO2 than route average`
    const ecoContextText = hasRouteAverage ? `Compared with ${routeAverage.toFixed(1)} kg route average` : 'Compared within this search'
    const isBestEco = hasCo2 && Number.isFinite(routeBest) && Math.abs(co2Value - routeBest) < 0.05

    // const updateTripFlights = (index, value) => {
    //     const utf = tripFlights.map((c, i) => {
    //         if (i === index) {
    //             return value;
    //         } else {
    //             return c;
    //         }
    //     });
    //     setTripFlights(utf);
    //     localStorage.setItem('tripFlights', JSON.stringify(utf))
    // }

    // const bookFlight = (flight) => {

    //     if (searchflights[2].tripValue === 'One-way') {
    //         updateTripFlights(0, json.flights[0])
    //         navigate('/passengerdetails')
    //     }
    //     if(searchflights[2].tripValue === 'Return'){
            
    //     }
        //     if(searchflights[2].tripValue === 'One-way'){
        //         const response = await fetch(`${host}/api/v1/flights?_id=${flightid}`, {
        //             method: 'GET',
        //             headers: {
        //               'Content-Type': 'application/json',
        //             }
        //         });
        //         const json = await response.json()
        //         updateTripFlights(0,json.flights[0])
        //         setSearch('false')
        //         navigate('/passengerdetails')
        //     }
        //     if(searchflights[2].tripValue === 'Return'){
        //         const response = await fetch(`${host}/api/v1/flights?_id=${flightid}`, {
        //             method: 'GET',
        //             headers: {
        //               'Content-Type': 'application/json',
        //             }
        //         });
        //         const json = await response.json()
        //         updateTripFlights(condition,json.flights[0])
        //         if(condition === 0){
        //             setCondition(condition+1)
        //             navigate('/rsearch')
        //         }
        //         if(condition === 1){
        //             setSearch('false')
        //             navigate('/passengerdetails')
        //         }
        //     }
        //   }
    // }


        return (
            <div className='flight-item'>
                <div className='flight-main'>
                    <div className='airways-details'>
                        <div className='airline-name'>{flight.flightname}</div>
                        <div className='details-item'>{flight.flightnumber}</div>
                        <div className='details-item'>Stops: {typeof flight.stops === 'number' ? flight.stops : 'N/A'}</div>
                    </div>
                    <div className='td-details'>
                        <div>
                            <div className='time-item'>{flight.departuretime}</div>
                            <div className='details-item'>{flight.departurecode}</div>
                        </div>
                        <div className='d-flex align-items-center flex-column justify-content-center td-center'>
                            <div className='journey-line'></div>
                            <div className='journey-duration'>{flight.duration || 'N/A'}</div>
                        </div>
                        <div>
                            <div className='time-item'>{flight.destinationtime}</div>
                            <div className='details-item'>{flight.destinationcode}</div>
                        </div>
                    </div>
                    <div className='price-booking-col'>
                        <div className='price-details'>${totalFare}</div>
                        <button onClick={() =>onChange(flight)} className='book-btn'>Select</button>
                    </div>
                    <div className={`eco-panel eco-level-${ecoLevel}`}>
                        {isBestEco ? <div className='eco-best-badge'>Best Eco Option</div> : null}
                        <div
                            className='eco-score-ring'
                            style={{ '--eco-score-angle': `${Math.round((ecoScore / 100) * 360)}deg` }}
                        >
                            <div className='eco-score-value'>{ecoScore}%</div>
                        </div>
                        <div className='eco-panel-title'>ECO SCORE</div>
                        <div className='eco-panel-item eco-panel-level'>{ecoLevelLabel[ecoLevel] || 'Unknown'} impact</div>
                        <div className='eco-panel-item'>CO2 {hasCo2 ? `~${co2Value.toFixed(1)} kg` : 'N/A'}</div>
                        <div className='eco-panel-item eco-panel-item-comparison'>{ecoComparisonText}</div>
                        <div className='eco-panel-item eco-panel-item-context'>{ecoContextText}</div>
                    </div>
                </div>
            </div>
        )
    }

    export default Flightitem
