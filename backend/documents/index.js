const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

const fmt = (value, fallback = '-') => {
    if (value === null || value === undefined || value === '') return fallback
    return escapeHtml(value)
}

const routeMeta = (city, airport, code) => {
    const cityText = String(city || '').trim()
    const airportText = String(airport || '').trim()
    const codeText = String(code || '').trim()
    const primary = cityText || codeText || '-'
    const secondary = airportText && airportText !== cityText && airportText !== codeText ? airportText : codeText
    return secondary && secondary !== primary ? `${primary} · ${secondary}` : primary
}

const flightSection = (flight, title, dateValue, tripClass) => `
    <div class="segment-card">
        <div class="segment-head">
            <div class="segment-title">${escapeHtml(title)}</div>
            <div class="segment-date">${fmt(dateValue)}</div>
        </div>
        <div class="route-row">
            <div class="route-node">
                <div class="code">${fmt(flight.departurecode)}</div>
                <div class="meta">${fmt(routeMeta(flight.departure, flight.departureairport, flight.departurecode))}</div>
                <div class="time">${fmt(flight.departuretime)}</div>
            </div>
            <div class="route-arrow">→</div>
            <div class="route-node">
                <div class="code">${fmt(flight.destinationcode)}</div>
                <div class="meta">${fmt(routeMeta(flight.destination, flight.destinationairport, flight.destinationcode))}</div>
                <div class="time">${fmt(flight.destinationtime)}</div>
            </div>
        </div>
        <div class="segment-footer">
            <div class="segment-footer-row">
              <span class="pill soft">Flight ${fmt(flight.flightnumber)}</span>
              <span>${fmt(flight.flightname)}</span>
            </div>
            <div class="segment-footer-row">
              <span class="pill soft">Class ${fmt(tripClass)}</span>
              <span class="status-ok">Confirmed</span>
            </div>
        </div>
    </div>
`

module.exports = ({ bookingid, passengersinfo = [], tripFlights = [] }) => {
    const booking = Array.isArray(tripFlights) && tripFlights.length ? tripFlights[0] : {}
    const today = new Date()
    const issueDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const outbound = {
        departure: booking.departure,
        departureairport: booking.departureairport,
        departurecode: booking.departurecode,
        departuretime: booking.departuretime,
        destination: booking.destination,
        destinationairport: booking.destinationairport,
        destinationcode: booking.destinationcode,
        destinationtime: booking.destinationtime,
        flightname: booking.flightname,
        flightnumber: booking.flightnumber,
    }

    const hasReturn = booking.triptype === 'Return'
    const inbound = hasReturn
        ? {
            departure: booking.rdeparture,
            departureairport: booking.rdepartureairport,
            departurecode: booking.rdeparturecode,
            departuretime: booking.rdeparturetime,
            destination: booking.rdestination,
            destinationairport: booking.rdestinationairport,
            destinationcode: booking.rdestinationcode,
            destinationtime: booking.rdestinationtime,
            flightname: booking.rflightname,
            flightnumber: booking.rflightnumber,
        }
        : null

    const passengerRows = (Array.isArray(passengersinfo) ? passengersinfo : []).map((p) => `
        <tr>
            <td>${fmt(`${p.firstname || ''} ${p.lastname || ''}`.trim())}</td>
            <td>${fmt(p.passport)}</td>
            <td>${fmt(p.dateofbirth)}</td>
            <td>${fmt(p.type || 'Adult')}</td>
            <td>${fmt(p.nationality)}</td>
        </tr>
    `).join('')

    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Eco Flights Booking Receipt</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #1f334a;
            background: #ffffff;
          }
          .sheet {
            width: 100%;
            border: 1px solid #d7e3ef;
            border-radius: 12px;
            overflow: hidden;
          }
          .header {
            padding: 16px 18px 14px;
            background: linear-gradient(90deg, #f4f8f4 0%, #eaf4e9 52%, #d9f0d2 100%);
            border-bottom: 1px solid #d3dfec;
          }
          .brand-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
          }
          .brand {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.2px;
            color: #2a3d56;
          }
          .pill {
            background: #2e8b57;
            color: #fff;
            border-radius: 999px;
            padding: 4px 10px;
            font-size: 12px;
            font-weight: 600;
          }
          .meta {
            display: flex;
            gap: 14px;
            font-size: 12px;
            color: #526882;
            flex-wrap: wrap;
            line-height: 1.35;
          }
          .meta span {
            overflow-wrap: anywhere;
          }
          .content {
            padding: 16px 18px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #2f455f;
            margin: 0 0 8px;
          }
          .segment-card {
            border: 1px solid #dce7f2;
            border-radius: 10px;
            background: #f9fcff;
            padding: 10px 12px;
            margin-bottom: 10px;
          }
          .segment-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 12px;
            color: #5d738d;
          }
          .segment-title { font-weight: 700; color: #2f455f; }
          .route-row {
            display: table;
            width: 100%;
            table-layout: fixed;
            margin-bottom: 8px;
          }
          .route-node, .route-arrow {
            display: table-cell;
            vertical-align: top;
          }
          .route-node { width: 47%; }
          .route-arrow {
            width: 6%;
            text-align: center;
            font-size: 17px;
            color: #65809a;
            font-weight: 700;
          }
          .code {
            font-size: 16px;
            font-weight: 700;
            color: #24364e;
            margin-bottom: 2px;
          }
          .meta, .segment-footer {
            font-size: 11px;
            color: #5d738d;
          }
          .time {
            font-size: 13px;
            font-weight: 600;
            color: #31465f;
            margin-top: 2px;
          }
          .segment-footer {
            border-top: 1px solid #e1eaf4;
            padding-top: 8px;
            display: grid;
            gap: 4px;
          }
          .segment-footer-row {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }
          .pill.soft {
            background: #edf4fb;
            color: #36516f;
            border-radius: 999px;
            padding: 2px 8px;
            font-size: 10px;
            font-weight: 600;
          }
          .status-ok {
            color: #1f7a47;
            font-weight: 600;
          }
          .table-wrap {
            border: 1px solid #dce7f2;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead th {
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            color: #5f758e;
            background: #f2f7fc;
            padding: 8px 10px;
            border-bottom: 1px solid #dfe9f3;
          }
          tbody td {
            padding: 8px 10px;
            font-size: 12px;
            color: #334b64;
            border-bottom: 1px solid #edf2f7;
          }
          tbody tr:last-child td { border-bottom: 0; }
          .totals {
            margin-top: 12px;
            border: 1px solid #dce7f2;
            border-radius: 10px;
            padding: 10px 12px;
            background: #fbfdff;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 6px;
            color: #435a74;
            gap: 12px;
          }
          .totals-row.total {
            margin: 0;
            padding-top: 6px;
            border-top: 1px solid #e2eaf3;
            font-size: 14px;
            font-weight: 700;
            color: #253b55;
          }
          .totals-label {
            flex: 1;
          }
          .totals-value {
            text-align: right;
            min-width: 110px;
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="brand-row">
              <div class="brand">Eco Flights</div>
              <div class="pill">E-Ticket Receipt</div>
            </div>
            <div class="meta">
              <span>Booking ID: ${fmt(bookingid)}</span>
              <span>Issue date: ${fmt(issueDate)}</span>
              <span>Trip type: ${fmt(booking.triptype || 'One-way')}</span>
            </div>
          </div>

          <div class="content">
            <h2 class="section-title">Flight details</h2>
            ${flightSection(outbound, 'Outbound flight', booking.departuredate, booking.tripclass)}
            ${hasReturn ? flightSection(inbound, 'Inbound flight', booking.rdeparturedate, booking.tripclass) : ''}

            <h2 class="section-title">Passenger details</h2>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Passenger</th>
                    <th>Passport</th>
                    <th>Date of birth</th>
                    <th>Type</th>
                    <th>Nationality</th>
                  </tr>
                </thead>
                <tbody>
                  ${passengerRows || '<tr><td colspan="5">No passengers found</td></tr>'}
                </tbody>
              </table>
            </div>

            <h2 class="section-title">Payment summary</h2>
            <div class="totals">
              <div class="totals-row">
                <span class="totals-label">Base fare</span>
                <span class="totals-value">USD ${fmt(booking.totalprice || 0, '0')}</span>
              </div>
              <div class="totals-row total">
                <span class="totals-label">Amount paid</span>
                <span class="totals-value">USD ${fmt(booking.totalprice || 0, '0')}</span>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}
