import React, { useState, useEffect } from 'react'
import '../styles/Passengerdetails.css'
import Alert from '../components/Alert';
import Input from '../components/Input'
import Dropdown from '../components/Dropdown';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '.././context/Auth'
import { useFlight } from '../context/Flight'
const Passengerdetails = () => {

    const { searchflights, tripFlights, alert, setAlert, invalid, setInvalid,
        localpassengers, setLocalPassengers
    } = useFlight()

    // const {auth, setAuth} = useAuth()

    const updatePassengerDetails = (index, value) => {
        const upd = localpassengers.map((c, i) => {
            if (i === index) {
                return {...value,'type':localpassengers[i].type};
            } else {
                return c;
            }
        });
        setLocalPassengers(upd);
    }


    const [localpassenger, setLocalPassenger] = useState({})
    const [personaldetails, setPersonaldetials] = useState({ title: "", firstname: "", lastname: "", dateofbirth: "", nationality: "", gender: "", passport: "", expirydate: "" })
    const [contactdetails, setContactdetails] = useState({ mobilenumber: "", email: "" })
    const [primarypassenger, setPrimarypassenger] = useState("Select Primary Contact");


    let navigate = useNavigate()


    const Capitalize = (str) => {
        if (!str) return ''
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const parseDateInput = (dateValue) => {
        if (!dateValue) return null

        const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(dateValue)
        if (isoMatch) {
            const year = Number(isoMatch[1])
            const month = Number(isoMatch[2])
            const day = Number(isoMatch[3])
            const date = new Date(year, month - 1, day)
            if (
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day
            ) {
                return date
            }
            return null
        }

        const usMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dateValue)
        if (usMatch) {
            const month = Number(usMatch[1])
            const day = Number(usMatch[2])
            const year = Number(usMatch[3])
            const date = new Date(year, month - 1, day)
            if (
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day
            ) {
                return date
            }
        }

        return null
    }

    const getAgeFromDob = (dob) => {
        const today = new Date()
        return today.getFullYear() - dob.getFullYear() - (
            today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0
        )
    }

    const toDateOnly = (rawValue) => {
        if (!rawValue) return null
        if (rawValue instanceof Date && !Number.isNaN(rawValue.getTime())) {
            return new Date(rawValue.getFullYear(), rawValue.getMonth(), rawValue.getDate())
        }
        if (typeof rawValue === 'string') {
            const parsed = parseDateInput(rawValue)
            if (parsed) return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
            const nativeDate = new Date(rawValue)
            if (!Number.isNaN(nativeDate.getTime())) {
                return new Date(nativeDate.getFullYear(), nativeDate.getMonth(), nativeDate.getDate())
            }
            return null
        }
        if (typeof rawValue?.toDate === 'function') {
            const d = rawValue.toDate()
            if (d instanceof Date && !Number.isNaN(d.getTime())) {
                return new Date(d.getFullYear(), d.getMonth(), d.getDate())
            }
        }
        if (typeof rawValue?.format === 'function') {
            const formatted = rawValue.format('YYYY-MM-DD')
            const parsed = parseDateInput(formatted)
            if (parsed) return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
        }
        return null
    }

    const getTripEndDate = () => {
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        if (searchflights?.[2]?.tripValue === 'Return') {
            const returnEnd = toDateOnly(searchflights?.[4]?.rtndate?.endDate)
            return returnEnd || todayStart
        }
        const oneWay = toDateOnly(searchflights?.[3]?.owdate)
        return oneWay || todayStart
    }

    const validatePassengerField = (fieldName, details) => {
        switch (fieldName) {
            case 'firstname':
                return /^[A-Za-z][A-Za-z\s'-]{1,49}$/.test((details.firstname || '').trim())
            case 'lastname':
                return /^[A-Za-z][A-Za-z\s'-]{1,49}$/.test((details.lastname || '').trim())
            case 'nationality':
                return /^[A-Za-z][A-Za-z\s'-]{1,55}$/.test((details.nationality || '').trim())
            case 'dateofbirth': {
                const dobDate = parseDateInput(details.dateofbirth)
                if (!dobDate) return false
                const today = new Date()
                const age = getAgeFromDob(dobDate)
                return dobDate <= today && age >= 0 && age <= 120
            }
            case 'passport':
                return /^[A-Z0-9]{6,12}$/.test(((details.passport || '')).trim())
            case 'expirydate': {
                const expiryDate = parseDateInput(details.expirydate)
                if (!expiryDate) return false
                const today = new Date()
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                const travelEndDate = getTripEndDate()
                const minAllowedDate = travelEndDate > todayStart ? travelEndDate : todayStart
                return expiryDate >= minAllowedDate
            }
            case 'gender':
                return /^(Male|Female)$/.test(details.gender || '')
            default:
                return true
        }
    }

    const validateContactField = (fieldName, details) => {
        if (fieldName === 'mobilenumber') {
            return /^[0-9]{10}$/.test(details.mobilenumber || '')
        }
        if (fieldName === 'email') {
            return /^\S+@\S+\.\S+$/.test((details.email || '').trim())
        }
        return true
    }

    const onChangepd = (e) => {
        const { name, value } = e.target
        let nextPersonalDetails = personaldetails
        if (name === 'firstname' || name === 'lastname' || name === 'nationality') {
            nextPersonalDetails = { ...personaldetails, [name]: Capitalize(value) }
            setPersonaldetials(nextPersonalDetails)
        } else if (name === 'passport') {
            nextPersonalDetails = { ...personaldetails, [name]: value.toUpperCase() }
            setPersonaldetials(nextPersonalDetails)
        } else {
            nextPersonalDetails = { ...personaldetails, [name]: value }
            setPersonaldetials(nextPersonalDetails)
        }

        const isValid = validatePassengerField(name, nextPersonalDetails)
        setAlert((prev) => ({ ...prev, [name]: isValid }))
        setInvalid((prev) => ({ ...prev, [name]: isValid ? '' : 'is-invalid' }))
    }
    const onChangecd = (e) => {
        const nextContact = { ...contactdetails, [e.target.name]: e.target.value }
        setContactdetails(nextContact)
        const isValid = validateContactField(e.target.name, nextContact)
        setAlert((prev) => ({ ...prev, [e.target.name]: isValid }))
        setInvalid((prev) => ({ ...prev, [e.target.name]: isValid ? '' : 'is-invalid' }))
    }
    const handleRadio = (e) => {
        const nextPersonalDetails = { ...personaldetails, 'gender': e.target.value }
        setPersonaldetials(nextPersonalDetails)
        const isValid = validatePassengerField('gender', nextPersonalDetails)
        setAlert((prev) => ({ ...prev, gender: isValid }))
        setInvalid((prev) => ({ ...prev, gender: isValid ? '' : 'is-invalid' }))
    }

    const onSP = (e) => {
        setPrimarypassenger(e.target.getAttribute('data-value'))
    }
    const onSetPP = () =>{
        if(pdvalidationcheck()) {
            updatePassengerDetails(passengernum, localpassenger)
        }
    }


    // // Passenger drop-down
    // const [pselected, setPselected] = useState("Select passenger");
    // const onCP = (e) => {
    //     setPselected(e.target.getAttribute('data-value'))
    //     dbpassengers.forEach((element) => {
    //         if (element.firstname+' '+element.lastname === e.target.getAttribute('data-value')) {
    //             setPersonaldetials({
    //                 ...personaldetails, "firstname": element.firstname,
    //                 "lastname": element.lastname,
    //                 "nationality": element.nationality,
    //                 "dateofbirth":element.dateofbirth,
    //                 'gender': element.gender
    //             })
    //         }
    //     })
    // }

    
    
    // // Passenger validation alerts
            



    // //  Passengers validation and accordion for mutliple passenger

    const [passvalidation, setPassvalidation] = useState(false)
    const [erroraccord, setErroraccord] = useState({})
    const [adddetails, setAdddetails] = useState([true])
    const [editdetails, setEditdetails] = useState([])
    const [passengernum, setPassengernum] = useState(0)

    const addDeatilsClick = (e) => {
        const isCurrentPassengerValid = pdvalidationcheck()
        if (!isCurrentPassengerValid) {
            setErroraccord({ ...erroraccord, [e.target.getAttribute('data-value')]: true })
        }
        if (isCurrentPassengerValid) {
            setErroraccord({ ...erroraccord, [e.target.getAttribute('data-value')]: false })
            setAdddetails({ ...adddetails, [e.target.getAttribute('data-value')]: true })
            setEditdetails({ ...editdetails, [e.target.getAttribute('data-value')]: false, [passengernum]: true })
            updatePassengerDetails(passengernum, localpassenger)
            setPassengernum(Number(e.target.getAttribute('data-value')))
            setPassvalidation(false)
            setPersonaldetials(
                {
                    ...personaldetails,
                    firstname: '',
                    lastname: '',
                    dateofbirth: '',
                    nationality: '',
                    gender: '',
                    passport: '',
                    expirydate: ''
                }
            )

        }
    }

    const editDetailsClick = (e) => {
        const isCurrentPassengerValid = pdvalidationcheck()
        if (!isCurrentPassengerValid) {
            setErroraccord({ ...erroraccord, [e.target.getAttribute('data-value')]: true })
        }
        if (isCurrentPassengerValid) {
            let value = e.target.getAttribute('data-value')
            setErroraccord({ ...erroraccord, [value]: false })
            setAdddetails({ ...adddetails, [value]: true })
            setEditdetails({ ...editdetails, [value]: false, [passengernum]: true })
            updatePassengerDetails(passengernum, localpassenger)
            setPassengernum((passengernum) => Number(e.target.getAttribute('data-value')))
            setPassvalidation(false)
            setPersonaldetials(
                {
                    ...personaldetails,
                    firstname: localpassengers[value].firstname,
                    lastname: localpassengers[value].lastname,
                    dateofbirth: localpassengers[value].dateofbirth,
                    nationality: localpassengers[value].nationality,
                    gender: localpassengers[value].gender
                }
            )
            localpassengers[value] = ''
        }
    }



    const pdvalidationcheck = () => {
        const efname = /^[A-Za-z][A-Za-z\s'-]{1,49}$/.test(personaldetails.firstname.trim())
        const elname = /^[A-Za-z][A-Za-z\s'-]{1,49}$/.test(personaldetails.lastname.trim())
        const enationality = /^[A-Za-z][A-Za-z\s'-]{1,55}$/.test(personaldetails.nationality.trim())
        const dobDate = parseDateInput(personaldetails.dateofbirth)
        const today = new Date()
        const age = dobDate ? getAgeFromDob(dobDate) : -1
        const edob = !!dobDate && dobDate <= today && age >= 0 && age <= 120
        const egender = /^(Male|Female)$/.test(personaldetails.gender)
        const epassport = /^[A-Z0-9]{6,12}$/.test((personaldetails.passport || '').trim())
        const eexpiry = (() => {
            const expiryDate = parseDateInput(personaldetails.expirydate)
            if (!expiryDate) return false
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            return expiryDate >= todayStart
        })()
        setAlert({
            ...alert, "firstname": efname,
            "lastname": elname,
            "nationality": enationality,
            "dateofbirth": edob,
            "gender": egender,
            "passport": epassport,
            "expirydate": eexpiry
        })
        setInvalid({
            ...invalid, 'firstname': efname ? '' : 'is-invalid',
            'lastname': elname ? '' : 'is-invalid',
            'nationality': enationality ? '' : 'is-invalid',
            'dateofbirth': edob ? '' : 'is-invalid',
            'gender': egender ? '' : 'is-invalid',
            'passport': epassport ? '' : 'is-invalid',
            'expirydate': eexpiry ? '' : 'is-invalid',

        })
        const isValid = efname && elname && enationality && edob && egender && epassport && eexpiry
        setPassvalidation(isValid)
        return isValid
    }

    const cdvalidationcheck = () => {
        const pp = primarypassenger.includes('Select Primary Contact')
        const emb = /^[0-9]{10}$/.test(contactdetails.mobilenumber)
        const email = /^\S+@\S+\.\S+$/.test(contactdetails.email.trim())
        setAlert({
            ...alert, "mobilenumber": emb,
            "email": email,
            "primarycontact": !pp
        })
        setInvalid({
            ...invalid, 'mobilenumber': emb ? '' : 'is-invalid',
            'email': email ? '' : 'is-invalid',
            'primarycontact': pp ? 'is-invalid' : '',
        })
        return emb && email && !pp
    }

    const updatePWCD = (localpassengers, primarypassenger, contactdetails) => {
        return localpassengers.map(item => {
            var temp = Object.assign({}, item);
            if (temp.firstname + ' ' + temp.lastname === primarypassenger) {
                temp.mobilenumber = contactdetails.mobilenumber
                temp.email = contactdetails.email.trim()
            }
            return temp;
        });
    }

    // // Proceed Method
    const proceed = () => {
        const isPassengerValid = pdvalidationcheck()
        if (isPassengerValid) {
            const isContactValid = cdvalidationcheck()
            updatePassengerDetails(passengernum, localpassenger)
            if (isContactValid) {
                var pin = updatePWCD(localpassengers, primarypassenger, contactdetails);
                setLocalPassengers(pin)
                localStorage.setItem('passengersdata', JSON.stringify(pin))
                // localStorage.setItem('primarypassenger', primarypassenger)
                navigate('/dashboard/bookingsummary')
            }
        }
    }

    useEffect(() => {
        setLocalPassenger({
            ...localpassenger,
            passengernumber:passengernum,
            // type:localpassengers[passengernum].type,
            firstname: personaldetails.firstname,
            lastname: personaldetails.lastname,
            dateofbirth: personaldetails.dateofbirth,
            nationality: personaldetails.nationality,
            gender: personaldetails.gender,
            passport: personaldetails.passport,
            passportexpirydate: personaldetails.expirydate,
            mobilenumber: NaN,
            email: ''
        })
    }, [personaldetails.firstname, personaldetails.lastname, personaldetails.dateofbirth, personaldetails.nationality, personaldetails.gender, personaldetails.passport, personaldetails.expirydate, passengernum])

    useEffect(() => {
        const passengerFields = ['firstname', 'lastname', 'dateofbirth', 'nationality', 'passport', 'expirydate', 'gender']
        passengerFields.forEach((field) => {
            const hasValue = field === 'gender' ? !!personaldetails.gender : String(personaldetails[field] || '').trim().length > 0
            if (!hasValue) return
            const valid = validatePassengerField(field, personaldetails)
            if (valid) {
                setAlert((prev) => ({ ...prev, [field]: true }))
                setInvalid((prev) => ({ ...prev, [field]: '' }))
            }
        })
    }, [personaldetails, searchflights, setAlert, setInvalid])

    useEffect(() => {
        const contactFields = ['mobilenumber', 'email']
        contactFields.forEach((field) => {
            const hasValue = String(contactdetails[field] || '').trim().length > 0
            if (!hasValue) return
            const valid = validateContactField(field, contactdetails)
            if (valid) {
                setAlert((prev) => ({ ...prev, [field]: true }))
                setInvalid((prev) => ({ ...prev, [field]: '' }))
            }
        })
    }, [contactdetails, setAlert, setInvalid])

    // useEffect(() => {

    //     if (localStorage.getItem('token')) {
    //         const controller = new AbortController();
    //         const signal = controller.signal;
    //         getUsersdata(localStorage.getItem('token'),signal)
    //             .then((element) => {
    //                 setContactdetails({ ...contactdetails, 'mobilenumber': element.user.mobilenumber, 'email': element.user.email })
    //             })
    //             .catch(err => {
    //                 if (err.name === "AbortError") {
    //                     console.log('aborted')
    //                 }
    //             })
    //         return () => {
    //             controller.abort();
    //         }
    //     }
    // }, [])

    return (
        <div className='passenger-d-con'>
            <div className='pd-title'>Passenger Details</div>
            <div className='d-flex justify-content-between pd-layout'>
                <div className='pd-main'>
                    <div className="accordion open" id="passengerAccordion">
                        {localpassengers.map((element, index) => {
                            return <React.Fragment key={`passenger-${index}`}>
                                <div className="accordion-item pass-accord-item" >
                                    <div className="pass-accord-header" id={`heading${index}`}  >
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <div className='pd-form-title'>{element.firstname ? `${element.firstname} ${element.lastname}` : <>Passenger {index + 1}</>} ({element.type})</div>
                                            {!adddetails[index] ? <div className="cord-add-d-btn" onClick={addDeatilsClick} data-value={index} data-bs-toggle="collapse" data-bs-target={passvalidation ? `#collapse${index}` : ''} aria-expanded='true' aria-controls={`collapse${index}`}>Add details</div> : <></>}
                                            {element.firstname && editdetails[index] ? <div className="cord-add-d-btn" onClick={editDetailsClick} data-value={index} data-bs-toggle="collapse" data-bs-target={passvalidation ? `#collapse${index}` : ''} aria-expanded='true' aria-controls={`collapse${index}`}>Edit Details</div> : <></>}
                                        </div>
                                    </div>
                                    <div className='next-stp-con'>
                                        {erroraccord[index] ? <div className='next-step-alert'>Please complete the details of the remaining passengers in your booking to continue to the next step.</div> : <></>}
                                    </div>
                                    <div id={`collapse${index}`} className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} aria-labelledby={`heading${index}`} data-bs-parent="#passengerAccordion">
                                        <div className="accordion-body pass-accord-body">
                                            <form className='pd-form'>
                                                {/* <div>{localStorage.getItem('token') ?
                                                        <div className="dropdown">
                                                            <button className="dbpass-btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                                                <div>{pselected}</div><div className='arrow down'></div>
                                                            </button>
                                                            <div className="dropdown-menu dbpass-dd-menu">
                                                                {dbpassengers.map((element,index) => {
                                                                    return <div className="dropdown-item" key={index+1} onClick={onCP} data-value={element.firstname+' '+element.lastname}>{element.firstname+' '+element.lastname}</div>
                                                                })}
                                                            </div>
                                                        </div> : <></>}
                                                    </div> */}
                                                <div className='pass-bm'>
                                                    <Input
                                                        className="passenger-mr"
                                                        skipBlurValidation={true}
                                                        placeholder='First name'
                                                        onChange={onChangepd}
                                                        value={personaldetails.firstname}
                                                        type="text"
                                                        name="firstname"
                                                        id="firstname"
                                                        validation="^[A-Za-z][A-Za-z '-]{1,49}$"
                                                        alertmsg="Enter a valid first name"
                                                    />
                                                    <Input
                                                        className="passenger"
                                                        skipBlurValidation={true}
                                                        placeholder='Last name'
                                                        onChange={onChangepd}
                                                        value={personaldetails.lastname}
                                                        type="text"
                                                        name="lastname"
                                                        id="lastname"
                                                        validation="^[A-Za-z][A-Za-z '-]{1,49}$"
                                                        alertmsg="Enter a valid last name"
                                                    />
                                                </div>
                                                <div className='pass-bm'>
                                                    <Input
                                                        className="passenger-mr"
                                                        skipBlurValidation={true}
                                                        placeholder='Date of birth'
                                                        onChange={onChangepd}
                                                        value={personaldetails.dateofbirth}
                                                        type="date"
                                                        name="dateofbirth"
                                                        id="dateofbirth"
                                                        validation="^((19|20)\\d{2}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\\d|3[01])|((0?[1-9]|1[0-2])\\/(0?[1-9]|[12]\\d|3[01])\\/(19|20)\\d{2}))$"
                                                        alertmsg="Enter a valid DOB"
                                                    />
                                                    <Input
                                                        className="passenger"
                                                        skipBlurValidation={true}
                                                        placeholder='Nationality'
                                                        onChange={onChangepd}
                                                        value={personaldetails.nationality}
                                                        type="text"
                                                        name="nationality"
                                                        id="nationality"
                                                        validation="^[A-Za-z][A-Za-z '-]{1,55}$"
                                                        alertmsg="Enter a valid nationality"
                                                    />
                                                </div>
                                                <div >
                                                    <div className='select-radio-con'>
                                                        <div className={`form-check select-radio`}>
                                                            <input className={`form-check-input select-input  ${invalid.gender} `}
                                                                onChange={(e) => {
                                                                    handleRadio(e)
                                                                }
                                                                }
                                                                checked={personaldetails.gender === 'Male'}
                                                                value="Male"
                                                                type="radio"
                                                                name="genderOptions"
                                                                id={`male-${index}`}
                                                                onBlur={() => {
                                                                    let regex = /^[a-zA-Z]{1,}$/.test(personaldetails.gender)
                                                                    setAlert({ ...alert, "gender": regex })
                                                                    setInvalid({ ...invalid, 'gender': regex ? '' : 'is-invalid' })
                                                                }}
                                                            />
                                                            <label className="form-check-label select-label" htmlFor={`male-${index}`}>
                                                                Male
                                                            </label>
                                                        </div>
                                                        <div className={`form-check select-radio `}>
                                                            <input className={`form-check-input select-input  ${invalid.gender}`}
                                                                onChange={handleRadio}
                                                                type="radio"
                                                                checked={personaldetails.gender === 'Female'}
                                                                value="Female"
                                                                name="genderOptions"
                                                                id={`female-${index}`}
                                                                onBlur={() => {
                                                                    let regex = /^[a-zA-Z]{1,}$/.test(personaldetails.gender)
                                                                    setAlert({ ...alert, "gender": regex })
                                                                    setInvalid({ ...invalid, 'gender': regex ? '' : 'is-invalid' })
                                                                }}
                                                            />
                                                            <label className="form-check-label select-label" htmlFor={`female-${index}`}>
                                                                Female
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {alert.gender === false ? <Alert error={"Please select a gender"} /> : <></>}
                                                </div>
                                                <div className='pass-bm'>
                                                    <Input
                                                        className="passenger-mr"
                                                        skipBlurValidation={true}
                                                        placeholder='Passport number'
                                                        onChange={onChangepd}
                                                        value={personaldetails.passport}
                                                        type="text"
                                                        name="passport"
                                                        id="passport"
                                                        validation="^[A-Za-z0-9]{6,12}$"
                                                        alertmsg="Use 6-12 letters/numbers"
                                                    />
                                                    <Input
                                                        className="passenger"
                                                        skipBlurValidation={true}
                                                        placeholder='Passport expiry date'
                                                        onChange={onChangepd}
                                                        value={personaldetails.expirydate}
                                                        type="date"
                                                        name="expirydate"
                                                        id="expirydate"
                                                        validation="^((19|20)\\d{2}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\\d|3[01])|((0?[1-9]|1[0-2])\\/(0?[1-9]|[12]\\d|3[01])\\/(19|20)\\d{2}))$"
                                                        alertmsg="Enter a valid expiry date"
                                                    />
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        })}
                    </div>
                    <div className='cd-con'>
                        <div className='pd-form'>
                            <div className='pd-form-title'>Contact Details</div>
                            <div className='pd-form-tdesc'>Please provide your contact details so that we can notify you the updates on your flight</div>
                            <div className='dd-con'>
                                {/* <div className="dropdown">
                                    <button className="dbpass-btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" onClick={onSetPP}>
                                        <div>{primarypassenger}</div><div className='arrow down'></div>
                                    </button>
                                    <div className="dropdown-menu dbpass-dd-menu">
                                    <div className="dropdown-item" onClick={onSP} data-value='Select Primary Contact'>Selected Primary Contact</div>
                                        {localpassengers.map((element) => {
                                            return <div className="dropdown-item"  onClick={onSP} data-value={element.firstname?element.firstname+' '+element.lastname:'Passenger '+element.passengernumber}>{element.firstname?element.firstname+' '+element.lastname:'Passenger '+element.passengernumber}</div>
                                        })}
                                    </div>
                                </div> */}
                                <Dropdown
                                    className="primary"
                                    value={primarypassenger}
                                    onChange={onSP}
                                    options={localpassengers}
                                    defaultOption="Select Primary Contact"
                                    onClick={onSetPP}
                                />
                                {alert.primarycontact === false ? <Alert error={"Please select a primary contact"} /> : <></>}
                            </div>
                            <div className='d-flex'>
                                <Input
                                    className="passenger-mr"
                                    skipBlurValidation={true}
                                    placeholder='Mobile number'
                                    onChange={onChangecd}
                                    value={contactdetails.mobilenumber}
                                    type="text"
                                    name="mobilenumber"
                                    id="mobilenumber"
                                    validation="^[0-9]{10}$"
                                    alertmsg="Mobile number should be 10 digits"
                                />
                                <Input
                                    className="passenger"
                                    skipBlurValidation={true}
                                    placeholder='Enter your email address'
                                    onChange={onChangecd}
                                    value={contactdetails.email}
                                    type="email"
                                    name="email"
                                    id="email"
                                    validation="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$"
                                    alertmsg="Enter a valid email"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='pd-summary'>
                    <div className='trip-summary-con'>
                        <div className='pd-ts-title'>Your trip summary</div>
                        {tripFlights.slice(0, searchflights[2].tripValue === 'Return' ? tripFlights.length : 1).map((flight, i) => {
                            const { flightname, departuredate, departuretime, departurecode, destinationdate, destinationtime, destinationcode, _id } = flight
                            return <React.Fragment key={`${_id}-${i}`}>
                                <div className='pd-fd-con'>
                                    <div className='pd-ts-body'>
                                        <div className='pd-ts-body-item'>{i === 0 ? 'Outbound flight' : 'Inbound flight'}</div>
                                        <div className='pd-ts-dates d-flex justify-content-between'>
                                            <div className='pd-ts-item'>{departuredate}</div>
                                            <div className='pd-ts-item'>{destinationdate}</div>
                                        </div>
                                        <div className='pd-ts-route d-flex'>
                                            <div className='pd-ts-node pd-ts-node-start'>
                                                <div className='pd-ts-item'>{departuretime}</div>
                                                <div className='pd-ts-item'>{departurecode}</div>
                                            </div>
                                            <div className='pd-ts-mid d-flex align-items-center'>
                                                <div className='flightline'></div>
                                            </div>
                                            <div className='pd-ts-node pd-ts-node-end'>
                                                <div className='pd-ts-item'>{destinationtime}</div>
                                                <div className='pd-ts-item'>{destinationcode}</div>
                                            </div>
                                        </div>
                                        <div className='pd-ts-body-item'>Operated by {flightname}</div>
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                        )
                        }
                        <div className='pd-ts-footer'>
                            <div className='pd-ts-footer-left'>
                                <div className='pd-ts-item'>Total trip price:</div>
                                <div className='pd-ts-passenger-count'>
                                    {searchflights[5].adultCount ? <>{searchflights[5].adultCount} Adult</> : ''}{searchflights[5].childCount ? <>+{searchflights[5].childCount}Child</> : ''}{searchflights[5].infantCount ? <>+{searchflights[5].infantCount}Infant</> : ''}
                                </div>
                            </div>
                            <div className='pd-ts-item pd-ts-total-price'>USD {searchflights[2].tripValue === 'Return' ? (searchflights[5].passengerCount - searchflights[5].infantCount) * (searchflights[5].passengerClass === 'Economy' ? tripFlights[0].economyprice + tripFlights[1].economyprice : tripFlights[0].premiumprice + tripFlights[1].premiumprice) : (searchflights[5].passengerCount - searchflights[5].infantCount) * (searchflights[5].passengerClass === 'Economy' ? tripFlights[0].economyprice : tripFlights[0].premiumprice)}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='btn-con'>
                <Button type="primary" onChange={proceed}>Proceed</Button>
            </div>
        </div>
    )
}

export default Passengerdetails




    // const [dbpassengers, setDbpassengers] = useState([])



    // const [isPDBackButtonClicked, setIsPDBackButtonClicked] = useState(false)

    // const navigateToSearch = (e) => {
    //   e.preventDefault();
    //   if(!isPDBackButtonClicked){
    //         if(searchflights[2].tripValue === 'One-way'){
    //             setIsPDBackButtonClicked(true)
    //             setCondition(0)
    //             navigate('/owsearch')
    //         }
    //         if(searchflights[2].tripValue === 'Return'){
    //             setIsPDBackButtonClicked(true)
    //             setCondition(1)
    //             navigate('/rsearch')
    //         }
    //   }
    // }
    // useEffect(() => {
    //     setPassarray(JSON.parse(localStorage.getItem('passarray')))
    //     setLocalPassengers(JSON.parse(localStorage.getItem('pdinitial')))
    //     setTripFlights(JSON.parse(localStorage.getItem('tripFlights')))
    //     setSearchFlights(JSON.parse(localStorage.getItem('searchflights')))

    //     window.history.pushState(historyobject, null, window.location.pathname);
    //     window.addEventListener('popstate',navigateToSearch);
    // }, [])

    // useEffect(() => {
    //     const controller = new AbortController();
    //     const signal = controller.signal;
    //     getPassengers(signal)
    //         .then((data) => { setDbpassengers(data.passenger) })
    //         .catch(err => {
    //             if (err.name === "AbortError") {
    //                 console.log('aborted')
    //             }
    //         })
    //     return () => {
    //         controller.abort();
    //     }
    // }, [])
