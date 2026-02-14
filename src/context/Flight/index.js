import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as moment from 'moment';
import axios from 'axios'
import { useAuth } from '../Auth'
import { saveAs } from 'file-saver';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://flightbooking-backend-f0eafuafcpdaavfn.canadacentral-01.azurewebsites.net/api/v1'
const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === 'true'

const defaultAirports = [
  {
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    id: 'JFK',
    country: 'United States',
  },
  {
    name: 'Los Angeles International Airport',
    city: 'Los Angeles',
    id: 'LAX',
    country: 'United States',
  },
  {
    name: 'San Francisco International Airport',
    city: 'San Francisco',
    id: 'SFO',
    country: 'United States',
  },
  {
    name: "O'Hare International Airport",
    city: 'Chicago',
    id: 'ORD',
    country: 'United States',
  },
  {
    name: 'Hartsfield-Jackson Atlanta International Airport',
    city: 'Atlanta',
    id: 'ATL',
    country: 'United States',
  },
  {
    name: 'Dallas/Fort Worth International Airport',
    city: 'Dallas',
    id: 'DFW',
    country: 'United States',
  },
];

const toMomentOrNull = (value) => {
  if (!value) return null
  if (moment.isMoment(value)) return value
  const parsed = moment(value)
  return parsed.isValid() ? parsed : null
}

const FlightContent = createContext()


const FlightProvider = (props) => {

  const { auth } = useAuth()
  axios.defaults.baseURL = API_BASE_URL
  axios.defaults.headers.common['auth-token'] = auth?.token
  const [Airports, setAirports] = useState([])
  const [airportsLoading, setAirportsLoading] = useState(false)
  const [airportsLoaded, setAirportsLoaded] = useState(false)
  // Home
  //  const [search,setSearch] = useState('')
  //  const [pdinitial,setPdInitial] = useState([{}])
  //  const[passarray,setPassarray] = useState([])


  const [searchflights, setSearchFlights] = useState([
    {
      'departure': '',
      'departurecode': '',
      'departuredisplay': 'Select Departure'
    },
    {
      'arrival': '',
      'arrivalcode': '',
      'arrivaldisplay': 'Select Destination'
    },
    {
      'tripValue': 'One-way'
    },
    {
      'owdate': null,
      'departuredate': null,
    },
    {
      'rtndate': {},
      'departuredate': null,
      'destinationdate': null
    },
    {
      'passengerCount': 1,
      'adultCount': 1,
      'childCount': 0,
      'infantCount': 0,
      'passengerClass': 'Economy'
    },
  ])

  const updateSearchFlights = (index, value) => {
    const utf = searchflights.map((c, i) => {
      if (i === index) {
        return value;
      } else {
        return c;
      }
    });
    setSearchFlights(utf);
  }

  let initialFlights = [{}, {}];
  const [tripFlights, setTripFlights] = useState(initialFlights)

  const [localpassengers, setLocalPassengers] = useState([])
  const [alert, setAlert] = useState({})
  const [invalid, setInvalid] = useState({})

  const ensureAirportsLoaded = useCallback(async () => {
    if (USE_MOCKS) {
      if (!airportsLoaded) {
        setAirports(defaultAirports)
        setAirportsLoaded(true)
      }
      return defaultAirports
    }

    if (airportsLoaded || airportsLoading) {
      return Airports.length ? Airports : defaultAirports
    }

    setAirportsLoading(true)
    try {
      const { data } = await axios.get('/airports')
      if (data?.success && Array.isArray(data.airports) && data.airports.length > 0) {
        setAirports(data.airports)
        setAirportsLoaded(true)
        return data.airports
      }
      setAirports(defaultAirports)
      setAirportsLoaded(true)
      return defaultAirports
    } catch (error) {
      setAirports(defaultAirports)
      setAirportsLoaded(true)
      return defaultAirports
    } finally {
      setAirportsLoading(false)
    }
  }, [Airports, airportsLoaded, airportsLoading])

  const searchAirports = async (query) => {
    const trimmedQuery = String(query || '').trim()
    if (!trimmedQuery) {
      if (!airportsLoaded && !airportsLoading) {
        await ensureAirportsLoaded()
      }
      return Airports.length ? Airports : defaultAirports
    }

    if (!USE_MOCKS) {
      try {
        const { data } = await axios.get(`/airports?q=${encodeURIComponent(trimmedQuery)}&max=100`)
        if (data?.success && Array.isArray(data.airports)) {
          return data.airports
        }
      } catch (error) {
        // Ignore API errors and fallback to local options.
      }
    }

    const normalizedQuery = trimmedQuery.toLowerCase()
    const source = Airports.length ? Airports : defaultAirports
    return source.filter((airport) =>
      [airport.city, airport.name, airport.id].some((field) =>
        String(field || '').toLowerCase().includes(normalizedQuery)
      )
    )
  }

  const createLocalPassengers = (data) => {
    var passdataarray = []
    if (data.adultCount) {
      for (let i = 0; i < data.adultCount; i++) {
        passdataarray.push({
          'passengernumber': i + 1,
          'firstname': '',
          'lastname': '',
          'dateofbirth': '',
          'nationality': '',
          'gender': '',
          'passport': '',
          'expirydate': '',
          'type': 'Adult',
          'mobilenumber': NaN,
          'email': ''
        })
      }
    }
    if (data.childCount) {
      for (let i = 0; i < data.childCount; i++) {
        passdataarray.push({
          'passengernumber': data.adultCount + i + 1,
          'firstname': '',
          'lastname': '',
          'dateofbirth': '',
          'nationality': '',
          'gender': '',
          'passport': '',
          'expirydate': '',
          'type': 'Child',
          'mobilenumber': NaN,
          'email': ''
        })
      }
    }
    if (data.infantCount) {
      for (let i = 0; i < data.infantCount; i++) {
        passdataarray.push({
          'passengernumber': data.adultCount + data.childCount + i + 1,
          'firstname': '',
          'lastname': '',
          'dateofbirth': '',
          'nationality': '',
          'gender': '',
          'passport': '',
          'expirydate': '',
          'type': 'Infant',
          'mobilenumber': NaN,
          'email': ''
        })
      }
    }
    localStorage.setItem('passengersdata', JSON.stringify(passdataarray))
    setLocalPassengers(passdataarray)
  }

  const createPdf = async (bookingid, passengersinfo, tripFlights) => {
    const { data } = await axios.post(`/createpdf`, {
      bookingid,
      passengersinfo,
      tripFlights,
    })
    return data
  }
  const getPdf = async (fileName = '') => {
    const url = fileName ? `/getpdf?file=${encodeURIComponent(fileName)}` : '/getpdf'
    const { data } = await axios.get(url, { responseType: 'blob' })
    const pdfBlob = new Blob([data], { type: 'application/pdf' })
    const normalizedName = fileName && String(fileName).endsWith('.pdf') ? fileName : 'eco-flights-ticket.pdf'
    saveAs(pdfBlob, normalizedName)
  }

  useEffect(() => {
    let cancelled = false

    const safeParse = (key, fallback = null) => {
      try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
      } catch (error) {
        return fallback
      }
    }

    const hydrateFromStorage = async () => {
      await ensureAirportsLoaded()
      if (cancelled) return

      const data = safeParse('searchedData')
      if (Array.isArray(data)) {
        const normalizedOneWay = {
          ...(data[3] || {}),
          owdate: toMomentOrNull(data?.[3]?.owdate),
        }
        const normalizedReturn = {
          ...(data[4] || {}),
          rtndate: {
            startDate: toMomentOrNull(data?.[4]?.rtndate?.startDate),
            endDate: toMomentOrNull(data?.[4]?.rtndate?.endDate),
          },
        }
        const normalizedData = [...data]
        normalizedData[3] = normalizedOneWay
        normalizedData[4] = normalizedReturn
        setSearchFlights(normalizedData)
      }

      const flightdata = safeParse('tripFlights')
      if (Array.isArray(flightdata)) {
        setTripFlights(flightdata)
      }

      const passengerData = safeParse('passengersdata')
      if (Array.isArray(passengerData)) {
        setLocalPassengers(passengerData)
      }
    }

    hydrateFromStorage()

    return () => {
      cancelled = true
    }
  }, [ensureAirportsLoaded])





  return (
    <FlightContent.Provider value={{
      Airports, searchflights, updateSearchFlights, tripFlights, setTripFlights,
      alert, setAlert, invalid, setInvalid, localpassengers, setLocalPassengers, createLocalPassengers,
      createPdf, getPdf, searchAirports, ensureAirportsLoaded, airportsLoading
    }}>
      {props.children}
    </FlightContent.Provider>
  )
}

const useFlight = () => useContext(FlightContent)

export { useFlight, FlightProvider }
