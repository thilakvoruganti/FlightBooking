import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'react-dates/initialize';
import { DateRangePicker, SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import "../styles/Home.css";
import * as moment from 'moment';

import { useFlight } from '../context/Flight'
import FilterDropdown from "../components/FilterDropdown";
import Button from "../components/Button";

const Home = () => {

  const navigate = useNavigate()


  const {
    Airports,
    searchflights,
    updateSearchFlights,
    createLocalPassengers,
    searchAirports,
    ensureAirportsLoaded,
    airportsLoading
  } = useFlight()

  const [validationMessage, setValidationMessage] = useState('')



  const [focus, setFocus] = useState(null);

  const safeMomentOrNull = (value) => {
    if (!value) return null
    if (moment.isMoment(value)) return value
    const parsed = moment(value)
    return parsed.isValid() ? parsed : null
  }


  const onChangeDeparture = (element) => {
    updateSearchFlights(0, {
      ...searchflights[0],
      'departure': element.city,
      'departurecode': element.id,
      'departuredisplay': element.city + ' ' + element.id
    })
  }
  const onChangeArrival = (element) => {
    updateSearchFlights(1, {
      ...searchflights[1],
      'arrival': element.city,
      'arrivalcode': element.id,
      'arrivaldisplay': element.city + ' ' + element.id
    })
  }
  const onDateChange = (element) => {
    const formattedDate = element && typeof element.format === 'function'
      ? element.format('ddd, MMM DD')
      : null
    updateSearchFlights(3, {
      ...searchflights[3],
      owdate: element,
      departuredate: formattedDate,
    })
  }

  const handleOnDateChange = ({ startDate, endDate }) => {
    updateSearchFlights(4, {
      ...searchflights[4],
      rtndate: { startDate, endDate },
      departuredate: startDate && typeof startDate.format === 'function' ? startDate.format('ddd, MMM DD') : null,
      destinationdate: endDate && typeof endDate.format === 'function' ? endDate.format('ddd, MMM DD') : null,
    })
  }

  const [calendarFocused, setCalendarFocus] = useState(false);
  const onCalendarFocusChange = ({ focused }) => {
    setCalendarFocus(focused)
  };

  const handleRadioClass = (event) => {
    updateSearchFlights(5, { ...searchflights[5], 'passengerClass': event.target.value })
  }


  const SearchFlights = (e) => {
    e.preventDefault()
    const hasDeparture = Boolean(searchflights[0].departurecode)
    const hasDestination = Boolean(searchflights[1].arrivalcode)
    const hasDate = searchflights[2].tripValue === 'Return'
      ? Boolean(searchflights[4].rtndate?.startDate && searchflights[4].rtndate?.endDate)
      : Boolean(searchflights[3].owdate)
    const sameAirport = searchflights[0].departurecode && searchflights[0].departurecode === searchflights[1].arrivalcode

    if (!hasDeparture || !hasDestination) {
      setValidationMessage('Select both departure and destination airports.')
      return
    }
    if (sameAirport) {
      setValidationMessage('Departure and destination airports must be different.')
      return
    }
    if (!hasDate) {
      setValidationMessage('Select your travel date(s) before searching.')
      return
    }

    setValidationMessage('')
    localStorage.setItem('searchedData', JSON.stringify(searchflights))
    createLocalPassengers(searchflights[5])
    navigate(`/owsearch/${searchflights[0].departurecode}&${searchflights[1].arrivalcode}`)
  }





  return (
    <>
      <div >
        <div className="home-con">
          <div className="sf-con">
            <div className="hero-card">
              <div className="hero-title">Smarter, Greener Flight Search</div>
              <div className="hero-subtitle">Compare fare, duration, and estimated CO2 before you book.</div>
            <form className="search-flights-form" onSubmit={SearchFlights}>
              {validationMessage ? <div className="home-validation-msg">{validationMessage}</div> : null}
              <div className="f-q-container">
                <FilterDropdown
                  className="primary br"
                  placeholder="From"
                  value={searchflights[0].departuredisplay}
                  options={Airports}
                  defaultOption="Select Departure"
                  onChange={onChangeDeparture}
                  onSearch={searchAirports}
                  onOpen={ensureAirportsLoaded}
                  isInitialLoading={airportsLoading}
                />
                <FilterDropdown
                  className="primary"
                  placeholder="To"
                  value={searchflights[1].arrivaldisplay}
                  options={Airports}
                  defaultOption="Select Destination"
                  onChange={onChangeArrival}
                  onSearch={searchAirports}
                  onOpen={ensureAirportsLoaded}
                  isInitialLoading={airportsLoading}
                />
                <div className="dropdown trip-details-con">
                  <div
                    className="trip-details-btn dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <div className="trip-placeholder">Trip</div>
                    <div className="trip-displayvalue">{searchflights[2].tripValue}</div>
                  </div>
                  <div className="dropdown-menu trip-select-con">
                    <div
                      className="trip-item"
                      onClick={() => updateSearchFlights(2, { 'tripValue': 'One-way' })}>
                      One-way
                    </div>
                    <div
                      className="trip-item"
                      onClick={() => updateSearchFlights(2, { 'tripValue': 'Return' })}>
                      Return
                    </div>
                  </div>
                </div>
                <div className="date-select-con d-flex">
                  {searchflights[2].tripValue === "One-way" ? (
                    <div className="depart date-select-item-d">
                      <div className="date-placeholder">Depart</div>
                      <SingleDatePicker
                        date={safeMomentOrNull(searchflights[3].owdate)}
                        onDateChange={onDateChange}
                        focused={calendarFocused}
                        onFocusChange={onCalendarFocusChange}
                        id="#123"
                        displayFormat="D MMM YYYY"
                        numberOfMonths={1}
                      />
                    </div>
                  ) : (
                    <div className="return date-select-item-r">
                      <div className="d-flex justify-content-between">
                        <div className="date-placeholder">Depart</div>
                        <div className="date-placeholder dp-r">Return</div>
                      </div>
                      <DateRangePicker
                        startDatePlaceholderText="Depart"
                        startDate={safeMomentOrNull(searchflights[4].rtndate.startDate)}
                        onDatesChange={handleOnDateChange}
                        endDatePlaceholderText="Return"
                        endDate={safeMomentOrNull(searchflights[4].rtndate.endDate)}
                        numberOfMonths={1}
                        displayFormat="D MMM YYYY"
                        focusedInput={focus}
                        onFocusChange={(focus) => setFocus(focus)}
                        startDateId="startDateMookh"
                        endDateId="endDateMookh"
                        minimumNights={0}
                      />
                    </div>
                  )}
                </div>
                <div className="dropdown passengercount-con">
                  <div
                    className="dropdown-toggle pc-dropdown-btn"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    data-bs-auto-close="outside">
                    <div className="pc-placeholder">Passenger / Class</div>
                    <div className="pc-displayvalue">
                      {searchflights[5].passengerCount} Passenger, {searchflights[5].passengerClass}
                    </div>
                  </div>
                  <div className="dropdown-menu pass-class-con">
                    <div className="pass-detail-con">
                      <div className="p-d-heading">Passenger</div>
                      <div className="d-flex justify-content-between">
                        <div className="p-holder">Adult (12years+)</div>
                        <div className="d-flex counter-con">
                          <div
                            className="p-counter"
                            onClick={() => {
                              if (searchflights[5].passengerCount > 1 && searchflights[5].adultCount > 1) {
                                updateSearchFlights(5, { ...searchflights[5], 'adultCount': searchflights[5].adultCount - 1, 'passengerCount': searchflights[5].passengerCount - 1 })
                              }
                            }}>
                            {" "}
                            -
                          </div>
                          <div className="p-value p-a-value">
                            {searchflights[5].adultCount}
                          </div>
                          <div
                            className="p-counter"
                            onClick={() => {
                              if (searchflights[5].passengerCount < 9) {
                                updateSearchFlights(5, { ...searchflights[5], 'adultCount': searchflights[5].adultCount + 1, 'passengerCount': searchflights[5].passengerCount + 1 })
                              }
                            }}>
                            +
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between">
                        <div className="p-holder">Child (2-11 years)</div>
                        <div className="d-flex counter-con">
                          <div
                            className="p-counter"
                            onClick={() => {
                              if (searchflights[5].passengerCount > 1 && searchflights[5].childCount > 0) {
                                updateSearchFlights(5, { ...searchflights[5], 'childCount': searchflights[5].childCount - 1, 'passengerCount': searchflights[5].passengerCount - 1 })
                              }
                            }}>
                            -
                          </div>
                          <div className="p-value p-c-value">
                            {searchflights[5].childCount}
                          </div>
                          <div
                            className="p-counter"
                            onClick={() => {
                              if (searchflights[5].passengerCount < 9) {
                                updateSearchFlights(5, { ...searchflights[5], 'childCount': searchflights[5].childCount + 1, 'passengerCount': searchflights[5].passengerCount + 1 })
                              }
                            }}>
                            +
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between mb-3">
                        <div className="p-holder">Infant (Under 2 years)</div>
                        <div className="d-flex counter-con">
                          <div
                            className="p-counter"
                            onClick={() => {
                              if (searchflights[5].passengerCount > 1 && searchflights[5].infantCount > 0) {
                                updateSearchFlights(5, { ...searchflights[5], 'infantCount': searchflights[5].infantCount - 1, 'passengerCount': searchflights[5].passengerCount - 1 })
                              }
                            }}>
                            -
                          </div>
                          <div className="p-value p-i-value">
                            {searchflights[5].infantCount}
                          </div>
                          <div
                            className="p-counter"
                            onClick={() => {
                              if (searchflights[5].passengerCount < 9) {
                                updateSearchFlights(5, { ...searchflights[5], 'infantCount': searchflights[5].infantCount + 1, 'passengerCount': searchflights[5].passengerCount + 1 })
                              }
                            }}>
                            +
                          </div>
                        </div>
                      </div>
                      <div className="class-con">
                        <div className="select-radio-con">
                          <div className="form-check select-radio sc-radio-input-c">
                            <div className="d-flex justify-content-between">
                              <label
                                className="form-check-label select-label"
                                htmlFor="economy">
                                Economy
                              </label>
                              <input
                                className="form-check-input select-input sc-radio-input"
                                onChange={handleRadioClass}
                                checked={searchflights[5].passengerClass === "Economy"}
                                value="Economy"
                                type="radio"
                                name="classOptions"
                                id="ecomomy"
                              />
                            </div>
                          </div>
                          <div className="form-check select-radio sc-radio-input-c">
                            <div className="d-flex justify-content-between">
                              <label
                                className="form-check-label select-label "
                                htmlFor="premium">
                                Premium
                              </label>
                              <input
                                className="form-check-input select-input sc-radio-input"
                                onChange={handleRadioClass}
                                type="radio"
                                checked={searchflights[5].passengerClass === "Premium"}
                                value="Premium"
                                name="classOptions"
                                id="premium"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button type="searchflights">Search Flights <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="logo transform-right bi bi-airplane" viewBox="0 0 16 16">
                  <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849Zm.894.448C7.111 2.02 7 2.569 7 3v4a.5.5 0 0 1-.276.447l-5.448 2.724a.5.5 0 0 0-.276.447v.792l5.418-.903a.5.5 0 0 1 .575.41l.5 3a.5.5 0 0 1-.14.437L6.708 15h2.586l-.647-.646a.5.5 0 0 1-.14-.436l.5-3a.5.5 0 0 1 .576-.411L15 11.41v-.792a.5.5 0 0 0-.276-.447L9.276 7.447A.5.5 0 0 1 9 7V3c0-.432-.11-.979-.322-1.401C8.458 1.159 8.213 1 8 1c-.213 0-.458.158-.678.599Z" />
                </svg></Button>
              </div>
            </form>
            </div>
          </div>
          <div className="img-con">
            <img src={require('../images/flights-grey.jpg')} alt="Air travel illustration" />
          </div>
        </div>
      </div>
    </>

  );
}

export default Home;









      // passarray.splice(0, passarray.length)
      // pdinitial.splice(0, pdinitial.length)
      // localStorage.removeItem('Searchdetails')
      // localStorage.setItem('Searchdetails', JSON.stringify(searchflights))
      // for (let i = 0; i < searchflights[5].adultCount; i++) {
      //   passarray.push('Adult')
      //   pdinitial.push({
      //     'passengernumber': i + 1,
      //     'firstname': '',
      //     'lastname': '',
      //     'dateofbirth': '',
      //     'nationality': '',
      //     'gender': '',
      //     'passport': '',
      //     'expirydate': '',
      //     'type': 'Adult',
      //     'mobilenumber': NaN,
      //     'email': ''
      //   })
      // }
      // for (let i = 0; i < searchflights[5].childCount; i++) {
      //   passarray.push('Child')
      //   pdinitial.push({
      //     'passengernumber': searchflights[5].adultCount + i + 1,
      //     'firstname': '',
      //     'lastname': '',
      //     'dateofbirth': '',
      //     'nationality': '',
      //     'gender': '',
      //     'passport': '',
      //     'expirydate': '',
      //     'type': 'Child',
      //     'mobilenumber': NaN,
      //     'email': ''
      //   })
      // }
      // for (let i = 0; i < searchflights[5].infantCount; i++) {
      //   passarray.push('Infant')
      //   pdinitial.push({
      //     'passengernumber': searchflights[5].adultCount + searchflights[5].childCount + i + 1,
      //     'firstname': '',
      //     'lastname': '',
      //     'dateofbirth': '',
      //     'nationality': '',
      //     'gender': '',
      //     'passport': '',
      //     'expirydate': '',
      //     'type': 'Infant',
      //     'mobilenumber': NaN,
      //     'email': ''
      //   })
      // }
      // localStorage.removeItem('passarray')
      // localStorage.removeItem('pdinitial')
      // localStorage.setItem('passarray', JSON.stringify(passarray))
      // localStorage.setItem('pdinitial', JSON.stringify(pdinitial))
      // localStorage.removeItem('searchflights')
      // localStorage.setItem('searchflights', JSON.stringify(searchflights))
      // localStorage.setItem('searchdate', searchdate)
