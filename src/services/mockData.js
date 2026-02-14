export const mockFlights = [
  {
    _id: 'mock-jfk-lax-1',
    flightname: 'EcoJet 101',
    flightnumber: 'EJ101',
    departurecode: 'JFK',
    destinationcode: 'LAX',
    departuretime: '08:05',
    destinationtime: '11:15',
    duration: 'PT6H10M',
    economyprice: 320,
    premiumprice: 640,
    co2kg: 188,
    ecolevel: 'Low',
    stops: 0,
  },
  {
    _id: 'mock-jfk-lax-2',
    flightname: 'SkyGreen 214',
    flightnumber: 'SG214',
    departurecode: 'JFK',
    destinationcode: 'LAX',
    departuretime: '12:40',
    destinationtime: '15:55',
    duration: 'PT6H15M',
    economyprice: 355,
    premiumprice: 690,
    co2kg: 210,
    ecolevel: 'Medium',
    stops: 1,
  },
  {
    _id: 'mock-lax-jfk-1',
    flightname: 'EcoJet 202',
    flightnumber: 'EJ202',
    departurecode: 'LAX',
    destinationcode: 'JFK',
    departuretime: '09:10',
    destinationtime: '17:35',
    duration: 'PT5H25M',
    economyprice: 330,
    premiumprice: 665,
    co2kg: 176,
    ecolevel: 'Low',
    stops: 0,
  },
  {
    _id: 'mock-ord-sfo-1',
    flightname: 'Midwest Wind 88',
    flightnumber: 'MW088',
    departurecode: 'ORD',
    destinationcode: 'SFO',
    departuretime: '07:20',
    destinationtime: '10:05',
    duration: 'PT4H45M',
    economyprice: 240,
    premiumprice: 520,
    co2kg: 150,
    ecolevel: 'Medium',
    stops: 0,
  },
]

const matchFlight = (flight, origin, destination) => {
  if (!origin || !destination) return true
  return (
    flight.departurecode.toUpperCase() === origin.toUpperCase() &&
    flight.destinationcode.toUpperCase() === destination.toUpperCase()
  )
}

export const getMockFlights = ({ origin, destination }) => {
  const matches = mockFlights.filter((flight) => matchFlight(flight, origin, destination))
  return matches.length ? matches : mockFlights
}
