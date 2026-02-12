const Flight = require('../models/Flight');
const { getFlightOffers, getAirportsByCodes, searchAirports } = require('../services/amadeus');

const US_AIRPORTS = [
  { id: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'United States' },
  { id: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'United States' },
  { id: 'SFO', city: 'San Francisco', name: 'San Francisco International Airport', country: 'United States' },
  { id: 'ORD', city: 'Chicago', name: "O'Hare International Airport", country: 'United States' },
  { id: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International Airport', country: 'United States' },
  { id: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International Airport', country: 'United States' },
  { id: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International Airport', country: 'United States' },
  { id: 'MIA', city: 'Miami', name: 'Miami International Airport', country: 'United States' },
  { id: 'BOS', city: 'Boston', name: 'Logan International Airport', country: 'United States' },
  { id: 'DEN', city: 'Denver', name: 'Denver International Airport', country: 'United States' },
];

const US_MAJOR_AIRPORT_CODES = [
  'ATL', 'LAX', 'ORD', 'DFW', 'DEN', 'JFK', 'SFO', 'SEA', 'LAS', 'MCO',
  'EWR', 'CLT', 'PHX', 'MIA', 'IAH', 'BOS', 'MSP', 'FLL', 'DTW', 'PHL',
  'LGA', 'BWI', 'SLC', 'DCA', 'SAN', 'IAD', 'MDW', 'TPA', 'BNA', 'HNL',
  'PDX', 'AUS', 'STL', 'HOU', 'MCI', 'SMF', 'CLE', 'RDU', 'SNA', 'PIT',
  'MKE', 'MSY', 'SJC', 'SAT', 'RSW', 'IND', 'CMH', 'CVG', 'JAX', 'OAK',
  'PBI', 'ABQ', 'BUF', 'BUR', 'ONT', 'OKC', 'OMA', 'TUS', 'ANC', 'CHS',
];

const AIRPORT_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
let popularAirportCache = {
  updatedAt: 0,
  airports: [],
};

const sortAirports = (airports = []) =>
  airports.sort((a, b) => {
    const cityCompare = (a.city || '').localeCompare(b.city || '');
    if (cityCompare !== 0) return cityCompare;
    return (a.id || '').localeCompare(b.id || '');
  });

const fetchPopularUsAirports = async () => {
  const now = Date.now();
  if (
    popularAirportCache.airports.length > 0 &&
    now - popularAirportCache.updatedAt < AIRPORT_CACHE_TTL_MS
  ) {
    return popularAirportCache.airports;
  }

  const airports = await getAirportsByCodes(US_MAJOR_AIRPORT_CODES);
  const sortedAirports = sortAirports(airports);
  popularAirportCache = {
    updatedAt: now,
    airports: sortedAirports,
  };

  return sortedAirports;
};

const allflights = async (req, res) => {
  try {
    const { departurecode, destinationcode, departuredate, sort, _id } = req.query;
    const queryObject = {};

    if (departurecode) {
      queryObject.departurecode = departurecode;
    }
    if (destinationcode) {
      queryObject.destinationcode = destinationcode;
    }
    if (departuredate) {
      queryObject.departuredate = departuredate;
    }
    if (_id) {
      queryObject._id = _id;
    }

    let result = Flight.find(queryObject);
    if (sort) {
      const sortList = sort + 'price';
      result = result.sort(sortList);
    }

    const flights = await result;
    res.status(200).json({ flights, success: true });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Failed to fetch flights', error: error.message });
  }
};

const createFlight = async (req, res) => {
  try {
    const flights = await Flight.create(req.body);
    res.status(200).json(flights);
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Failed to create flight', error: error.message });
  }
};

const getAirports = async (req, res) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const max = Number(req.query.max) || 100;
    const countryCode = typeof req.query.countryCode === 'string' ? req.query.countryCode.trim() : 'US';

    if (query) {
      const amadeusAirports = await searchAirports({
        keyword: query,
        max,
        countryCode: countryCode || 'US',
      });
      return res.status(200).json({
        success: true,
        source: 'amadeus-search',
        airports: sortAirports(amadeusAirports),
      });
    }

    const popularAirports = await fetchPopularUsAirports();
    if (popularAirports.length) {
      return res.status(200).json({ success: true, source: 'amadeus-us-major', airports: popularAirports });
    }

    const fallbackCodes = US_AIRPORTS.map((a) => a.id);
    const fallbackAirports = await getAirportsByCodes(fallbackCodes);
    if (fallbackAirports.length) {
      return res.status(200).json({ success: true, source: 'amadeus-us-top10', airports: sortAirports(fallbackAirports) });
    }
  } catch (error) {
    return res.status(200).json({ success: true, source: 'static-us', airports: US_AIRPORTS });
  }

  return res.status(200).json({ success: true, source: 'static-us', airports: US_AIRPORTS });
};

const fetchFlightsFromAmadeus = async (req, res) => {
  try {
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults = 1,
      max = 10,
      currencyCode = 'USD',
    } = req.query;

    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return res.status(400).json({
        success: false,
        msg: 'originLocationCode, destinationLocationCode and departureDate are required',
      });
    }

    const flights = await getFlightOffers({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults: Number(adults),
      max: Number(max),
      currencyCode,
    });

    return res.status(200).json({
      success: true,
      source: 'amadeus',
      count: flights.length,
      flights,
    });
  } catch (error) {
    try {
      const { originLocationCode, destinationLocationCode } = req.query;
      const fallbackQuery = {};
      if (originLocationCode) fallbackQuery.departurecode = originLocationCode;
      if (destinationLocationCode) fallbackQuery.destinationcode = destinationLocationCode;

      const fallbackFlights = await Flight.find(fallbackQuery).limit(30);
      return res.status(200).json({
        success: true,
        source: 'db-fallback',
        count: fallbackFlights.length,
        flights: fallbackFlights,
        amadeusUnavailable: true,
        amadeusError: error.message,
      });
    } catch (fallbackError) {
      return res.status(200).json({
        success: false,
        source: 'amadeus-unavailable',
        count: 0,
        flights: [],
        amadeusUnavailable: true,
        amadeusError: error.message,
        fallbackError: fallbackError.message,
      });
    }
  }
};

const syncFlightsFromAmadeus = async (req, res) => {
  try {
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults = 1,
      max = 10,
      currencyCode = 'USD',
    } = req.body;

    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return res.status(400).json({
        success: false,
        msg: 'originLocationCode, destinationLocationCode and departureDate are required',
      });
    }

    const flights = await getFlightOffers({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults: Number(adults),
      max: Number(max),
      currencyCode,
    });

    const persisted = [];
    for (const flight of flights) {
      const filter = {
        flightnumber: flight.flightnumber,
        departurecode: flight.departurecode,
        destinationcode: flight.destinationcode,
        departuredate: flight.departuredate,
      };

      const updated = await Flight.findOneAndUpdate(
        filter,
        { $set: flight },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      persisted.push(updated);
    }

    return res.status(200).json({
      success: true,
      source: 'amadeus',
      count: persisted.length,
      flights: persisted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Failed to sync flights from Amadeus',
      error: error.message,
    });
  }
};

module.exports = {
  allflights,
  createFlight,
  getAirports,
  fetchFlightsFromAmadeus,
  syncFlightsFromAmadeus,
};
