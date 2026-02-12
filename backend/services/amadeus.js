const https = require('https');

const AMADEUS_BASE_URL = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

const requestJson = (url, options = {}, body = null) =>
  new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let raw = '';
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = raw ? JSON.parse(raw) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
            return;
          }
          reject(
            new Error(
              `Amadeus request failed (${res.statusCode}): ${parsed.error_description || parsed.errors?.[0]?.detail || raw}`
            )
          );
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });

const getAccessToken = async () => {
  if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
    throw new Error('Missing Amadeus credentials. Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET.');
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: AMADEUS_CLIENT_ID,
    client_secret: AMADEUS_CLIENT_SECRET,
  }).toString();

  const tokenResponse = await requestJson(
    `${AMADEUS_BASE_URL}/v1/security/oauth2/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    },
    body
  );

  return tokenResponse.access_token;
};

const formatDate = (isoDateTime) => {
  if (!isoDateTime) return '';
  const d = new Date(isoDateTime);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

const formatTime = (isoDateTime) => {
  if (!isoDateTime) return '';
  const d = new Date(isoDateTime);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const toRadians = (value) => (value * Math.PI) / 180;

const calculateDistanceKm = (from, to) => {
  if (!from || !to) return null;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const getEcoLevel = (co2Kg) => {
  if (typeof co2Kg !== 'number') return 'unknown';
  if (co2Kg <= 120) return 'low';
  if (co2Kg <= 220) return 'medium';
  return 'high';
};

const normalizeOffer = (offer, dictionaries, adults = 1, airportGeoByCode = new Map()) => {
  const itinerary = offer?.itineraries?.[0];
  const firstSegment = itinerary?.segments?.[0];
  const lastSegment = itinerary?.segments?.[itinerary.segments.length - 1];
  if (!itinerary || !firstSegment || !lastSegment) return null;

  const carrierCode = firstSegment.carrierCode || 'NA';
  const carrierName = dictionaries?.carriers?.[carrierCode] || carrierCode;

  const totalFare = Number(offer?.price?.grandTotal || 0);
  const basePerPassenger = adults > 0 ? Math.max(0, totalFare / adults) : totalFare;
  const economyPrice = Math.round(basePerPassenger);
  const premiumPrice = Math.round(economyPrice * 1.35);
  const stops = Math.max(0, (itinerary?.segments?.length || 1) - 1);
  const departureCode = firstSegment.departure.iataCode;
  const destinationCode = lastSegment.arrival.iataCode;
  let totalDistanceKmRaw = 0;
  let hasDistanceData = false;

  (itinerary?.segments || []).forEach((segment) => {
    const fromCode = segment?.departure?.iataCode;
    const toCode = segment?.arrival?.iataCode;
    const fromGeo = airportGeoByCode.get(fromCode);
    const toGeo = airportGeoByCode.get(toCode);
    const segmentDistance = calculateDistanceKm(fromGeo, toGeo);
    if (typeof segmentDistance === 'number') {
      totalDistanceKmRaw += segmentDistance;
      hasDistanceData = true;
    }
  });

  const distanceKmRaw = hasDistanceData ? totalDistanceKmRaw : null;
  const distanceKm = typeof distanceKmRaw === 'number' ? Math.round(distanceKmRaw) : null;
  const co2KgRaw = typeof distanceKmRaw === 'number' ? distanceKmRaw * 0.115 : null;
  const co2Kg = typeof co2KgRaw === 'number' ? Number(co2KgRaw.toFixed(1)) : null;

  return {
    flightname: carrierName,
    flightnumber: `${carrierCode}${firstSegment.number || ''}`,
    economyprice: economyPrice,
    premiumprice: premiumPrice,
    departure: departureCode,
    departuretime: formatTime(firstSegment.departure.at),
    departureairport: departureCode,
    departurecode: departureCode,
    destination: destinationCode,
    destinationtime: formatTime(lastSegment.arrival.at),
    destinationairport: destinationCode,
    destinationcode: destinationCode,
    departuredate: formatDate(firstSegment.departure.at),
    destinationdate: formatDate(lastSegment.arrival.at),
    duration: itinerary.duration || '',
    stops,
    distancekm: distanceKm,
    co2kg: co2Kg,
    ecolevel: getEcoLevel(co2Kg),
    ecocomparison: 'unknown',
    source: 'amadeus',
    lastsyncedat: new Date(),
  };
};

const getFlightOffers = async ({
  originLocationCode,
  destinationLocationCode,
  departureDate,
  adults = 1,
  max = 10,
  currencyCode = 'INR',
}) => {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    originLocationCode,
    destinationLocationCode,
    departureDate,
    adults: String(adults),
    max: String(max),
    currencyCode,
  });

  const response = await requestJson(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const offers = Array.isArray(response?.data) ? response.data : [];
  const dictionaries = response?.dictionaries || {};
  const routeCodes = new Set();

  offers.forEach((offer) => {
    const itinerary = offer?.itineraries?.[0];
    (itinerary?.segments || []).forEach((segment) => {
      if (segment?.departure?.iataCode) {
        routeCodes.add(segment.departure.iataCode);
      }
      if (segment?.arrival?.iataCode) {
        routeCodes.add(segment.arrival.iataCode);
      }
    });
  });

  const airportGeoByCode = await getAirportGeoByCodes(token, Array.from(routeCodes));
  const normalizedOffers = offers
    .map((offer) => normalizeOffer(offer, dictionaries, adults, airportGeoByCode))
    .filter(Boolean);
  const co2Values = normalizedOffers
    .map((offer) => offer.co2kg)
    .filter((value) => typeof value === 'number');
  const averageCo2 = co2Values.length
    ? co2Values.reduce((sum, value) => sum + value, 0) / co2Values.length
    : null;

  return normalizedOffers.map((offer) => {
    if (typeof offer.co2kg !== 'number' || typeof averageCo2 !== 'number') {
      return offer;
    }

    const delta = offer.co2kg - averageCo2;
    if (Math.abs(delta) <= 1) {
      return { ...offer, ecocomparison: 'average' };
    }

    let ecocomparison = 'average';
    if (delta < 0) ecocomparison = 'lower';
    if (delta > 0) ecocomparison = 'higher';
    return { ...offer, ecocomparison };
  });
};

const getAirportByCode = async (token, iataCode) => {
  const params = new URLSearchParams({
    subType: 'AIRPORT',
    keyword: iataCode,
  });

  const response = await requestJson(
    `${AMADEUS_BASE_URL}/v1/reference-data/locations?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const candidates = Array.isArray(response?.data) ? response.data : [];
  return candidates.find((c) => c?.iataCode === iataCode) || null;
};

const normalizeAirport = (airport) => {
  const toDisplayCase = (value) => {
    if (!value) return '';
    const text = String(value).trim();
    if (!text) return '';

    // Amadeus search can return fully uppercased labels; normalize for UI readability.
    const isAllCaps = /[A-Z]/.test(text) && !/[a-z]/.test(text);
    if (!isAllCaps) return text;

    return text
      .toLowerCase()
      .replace(/\b([a-z])/g, (match) => match.toUpperCase());
  };

  const normalizeCountry = (value) => {
    const country = toDisplayCase(value);
    if (country === 'United States Of America') return 'United States';
    return country;
  };

  const iataCode = airport?.iataCode;
  if (!iataCode) return null;

  return {
    id: iataCode,
    city: toDisplayCase(airport?.address?.cityName || airport?.name || iataCode),
    name: toDisplayCase(airport?.name || iataCode),
    country: normalizeCountry(airport?.address?.countryName || ''),
  };
};

const getAirportsByCodes = async (codes = []) => {
  const uniqueCodes = Array.from(new Set(codes.filter(Boolean)));
  if (!uniqueCodes.length) return [];

  const token = await getAccessToken();
  const resolved = [];

  for (const code of uniqueCodes) {
    const airport = await getAirportByCode(token, code);
    if (airport) {
      const formatted = normalizeAirport(airport);
      if (formatted) {
        resolved.push(formatted);
      }
      continue;
    }

    resolved.push({
      id: code,
      city: code,
      name: code,
      country: '',
    });
  }

  return resolved;
};

const getAirportGeoByCodes = async (token, codes = []) => {
  const uniqueCodes = Array.from(new Set(codes.filter(Boolean)));
  const airportGeoByCode = new Map();

  for (const code of uniqueCodes) {
    try {
      const airport = await getAirportByCode(token, code);
      const latitude = airport?.geoCode?.latitude;
      const longitude = airport?.geoCode?.longitude;
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        airportGeoByCode.set(code, { latitude, longitude });
      }
    } catch (error) {
      // Continue, distance and CO2 will be unavailable for this airport.
    }
  }

  return airportGeoByCode;
};

const searchAirports = async ({ keyword = '', max = 100, countryCode = 'US' } = {}) => {
  const token = await getAccessToken();
  const boundedMax = Math.max(1, Math.min(Number(max) || 100, 250));
  const params = new URLSearchParams({
    subType: 'AIRPORT',
    view: 'FULL',
    'page[limit]': String(boundedMax),
  });

  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword) {
    params.set('keyword', trimmedKeyword);
  }

  if (countryCode) {
    params.set('countryCode', countryCode);
  }

  const response = await requestJson(
    `${AMADEUS_BASE_URL}/v1/reference-data/locations?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const airports = Array.isArray(response?.data) ? response.data : [];
  const unique = new Map();
  airports.forEach((airport) => {
    const formatted = normalizeAirport(airport);
    if (formatted && !unique.has(formatted.id)) {
      unique.set(formatted.id, formatted);
    }
  });

  return Array.from(unique.values());
};

module.exports = {
  getFlightOffers,
  getAirportsByCodes,
  searchAirports,
};
