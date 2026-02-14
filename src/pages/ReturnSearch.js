import React,{useEffect,useState, useMemo, useRef} from 'react'
import Flightitem from "../components/Flightitem";
import FlightitemSkeleton from "../components/FlightitemSkeleton";
import '../styles/Search.css'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'
import {useFlight} from '../context/Flight'
import { getMockFlights } from '../services/mockData'


const ReturnSearch = () => {

    const navigate = useNavigate()
    const params = useParams()
    const {searchflights,tripFlights, setTripFlights} = useFlight()

    const[flights,setFlights]= useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [sortBy, setSortBy] = useState('eco')
    const hasFetchedRef = useRef(false)

    const getDateForAmadeus = () => {
        const tripDate = searchflights[4]?.rtndate?.endDate
        return tripDate && typeof tripDate.format === 'function' ? tripDate.format('YYYY-MM-DD') : null
    }

    const useMocks = process.env.REACT_APP_USE_MOCKS === 'true'

    const getFlights = async(from,to) => {
        setIsLoading(true)
        const departureDate = getDateForAmadeus()
        try {
            if (useMocks) {
                const offlineFlights = getMockFlights({ origin: from, destination: to })
                setFlights(offlineFlights)
                return
            }
            if (departureDate) {
                try {
                    const { data } = await axios.get(`/flights/amadeus?originLocationCode=${from}&destinationLocationCode=${to}&departureDate=${departureDate}&adults=${searchflights[5].adultCount || 1}&max=20&currencyCode=USD`)
                    if (data?.success && Array.isArray(data.flights) && data.flights.length > 0) {
                        setFlights(data.flights)
                        return
                    }
                } catch (error) {
                    // Fall back to local backend flight data when Amadeus fails.
                }
            }

            const {data} = await axios.get(`/flights?departurecode=${from}&destinationcode=${to}`)
            setFlights(Array.isArray(data.flights) ? data.flights : [])
        } catch (error) {
            setFlights([])
        } finally {
            setIsLoading(false)
        }
    }
    
    
    useEffect(() => {
        if (hasFetchedRef.current) return
        hasFetchedRef.current = true
        const searchquery = params.slug.split('&')
        if(searchquery[0] && searchquery[1]){
            getFlights(searchquery[0],searchquery[1])
        }
    }, [])


    const updateTripFlights = (index, value) => {
        const utf = tripFlights.map((c, i) => {
            if (i === index) {
                return value;
            } else {
                return c;
            }
        });
        setTripFlights(utf);
        localStorage.setItem('tripFlights', JSON.stringify(utf))
    }

    const bookFlight = (flight) => {

        if(searchflights[2].tripValue === 'Return'){
            updateTripFlights(1, flight)
            navigate(`/passengerdetails`)
        }
    }

    const getDurationMinutes = (duration) => {
        if (!duration || typeof duration !== 'string') return Number.MAX_SAFE_INTEGER
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
        if (!match) return Number.MAX_SAFE_INTEGER
        const hours = parseInt(match[1] || '0', 10)
        const minutes = parseInt(match[2] || '0', 10)
        return (hours * 60) + minutes
    }

    const getFlightPrice = (flight) => {
        const baseFare = searchflights[5].passengerClass === 'Economy' ? flight.economyprice : flight.premiumprice
        const payingPassengers = searchflights[5].passengerCount - searchflights[5].infantCount
        return (typeof baseFare === 'number' ? baseFare : Number.MAX_SAFE_INTEGER) * payingPassengers
    }

    const ecoStats = useMemo(() => {
        const withCo2 = flights
            .map((flight) => Number(flight.co2kg))
            .filter((co2) => Number.isFinite(co2) && co2 > 0)
        if (!withCo2.length) {
            return { routeAverageCo2: null, minCo2: null }
        }
        const total = withCo2.reduce((sum, co2) => sum + co2, 0)
        const routeAverageCo2 = total / withCo2.length
        const minCo2 = Math.min(...withCo2)
        return { routeAverageCo2, minCo2 }
    }, [flights])

    const sortedFlights = useMemo(() => {
        const items = [...flights]
        return items.sort((a, b) => {
            if (sortBy === 'cheapest') {
                return getFlightPrice(a) - getFlightPrice(b)
            }
            if (sortBy === 'fastest') {
                return getDurationMinutes(a.duration) - getDurationMinutes(b.duration)
            }
            const aCo2 = Number.isFinite(Number(a.co2kg)) ? Number(a.co2kg) : Number.MAX_SAFE_INTEGER
            const bCo2 = Number.isFinite(Number(b.co2kg)) ? Number(b.co2kg) : Number.MAX_SAFE_INTEGER
            return aCo2 - bCo2
        })
    }, [flights, sortBy, searchflights])

  return (
    <div className="flight-item-con">
        <div>{searchflights[4].destinationdate}</div>
        <div className='flight-item-title'>
            Select your departure flight
            <div>from <span>{searchflights[1].arrival}</span> to <span>{searchflights[0].departure}</span></div> 
        </div>
        <div className='flight-sort-row'>
            <button className={`flight-sort-pill ${sortBy === 'cheapest' ? 'active' : ''}`} onClick={() => setSortBy('cheapest')}>Cheapest</button>
            <button className={`flight-sort-pill ${sortBy === 'fastest' ? 'active' : ''}`} onClick={() => setSortBy('fastest')}>Fastest</button>
            <button className={`flight-sort-pill ${sortBy === 'eco' ? 'active' : ''}`} onClick={() => setSortBy('eco')}>Lowest CO2</button>
        </div>
        {typeof ecoStats.routeAverageCo2 === 'number' ? (
            <div className='flight-eco-baseline'>Eco baseline for this route: ~{ecoStats.routeAverageCo2.toFixed(1)} kg CO2 per passenger (from shown flights)</div>
        ) : null}
        {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => <FlightitemSkeleton key={`rt-skeleton-${index}`} />)
        ) : (
            sortedFlights.map((flight, index) => {
                return <Flightitem key={flight._id || `${flight.flightnumber}-${flight.departuretime}-${index}`} flight={flight} onChange={bookFlight} routeAverageCo2={ecoStats.routeAverageCo2} minCo2={ecoStats.minCo2}/>
            })
        )}
        {!isLoading && sortedFlights.length === 0 ? (
            <div className='flight-empty-state'>No flights found for this route and date.</div>
        ) : null}
        {/* <div className='d-flex justify-content-center'>
        {showElement?<div className='undo-alert-con'>
                        <div>Departure selected</div>
                        <div onClick={undoSelection} >Undo selection</div>
                    </div>
                    :<></>
        }
        </div> */}
    </div>
  )
}

export default ReturnSearch
