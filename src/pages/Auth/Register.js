import React, { useEffect, useState } from 'react'
import { useNavigate, } from 'react-router-dom'
import "../../styles/Auth.css";
import Alert from '../../components/Alert';
import Input from '../../components/Input';
import Dropdown from '../../components/Dropdown'
import { useAuth } from '../../context/Auth'
import { useFlight } from '../../context/Flight'
import { API_BASE } from '../../config/api'

const Register = () => {
    let navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        "remail": "",
        "rpassword": "",
        "rcpassword": "",
        "rcountrycode": "+1",
        "rmobilenumber": "",
        "rfirstname": "",
        "rlastname": "",
        "rdateofbirth": "",
        "rgender": "",
        "rstate": "Select State"
    })

    const States = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
        "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
        "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
        "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
        "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
        "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
        "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
        "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "District of Columbia"
    ]

    const {auth, setAuth } = useAuth()

    const { alert, setAlert, invalid, setInvalid} = useFlight()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [serverError, setServerError] = useState('')

    useEffect(() => {
        setAlert((prev) => ({
            ...prev,
            remail: true,
            rpassword: true,
            rcpassword: true,
            rmobilenumber: true,
            rfirstname: true,
            rlastname: true,
            rdateofbirth: true,
            rgender: true,
            rstate: true,
        }))
        setInvalid((prev) => ({
            ...prev,
            remail: '',
            rpassword: '',
            rcpassword: '',
            rmobilenumber: '',
            rfirstname: '',
            rlastname: '',
            rdateofbirth: '',
            rgender: '',
            rstate: '',
        }))
    }, [setAlert, setInvalid])

    const onChangelogin = (e) => {
        if (serverError) setServerError('')
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }
    const handleRadio = (e) => {
        if (serverError) setServerError('')
        setCredentials({ ...credentials, 'rgender': e.target.value })
    }
    const selectState = (e) => {
        if (serverError) setServerError('')
        setCredentials({ ...credentials, "rstate": e.target.getAttribute('data-value') })
    }

    const parseDobInput = (dobValue) => {
        if (!dobValue) return null

        // Accept both browser date value (YYYY-MM-DD) and typed US date (MM/DD/YYYY).
        const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(dobValue)
        if (isoMatch) {
            const year = Number(isoMatch[1])
            const month = Number(isoMatch[2])
            const day = Number(isoMatch[3])
            const dob = new Date(year, month - 1, day)
            if (
                dob.getFullYear() === year &&
                dob.getMonth() === month - 1 &&
                dob.getDate() === day
            ) {
                return dob
            }
            return null
        }

        const usMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dobValue)
        if (usMatch) {
            const month = Number(usMatch[1])
            const day = Number(usMatch[2])
            const year = Number(usMatch[3])
            const dob = new Date(year, month - 1, day)
            if (
                dob.getFullYear() === year &&
                dob.getMonth() === month - 1 &&
                dob.getDate() === day
            ) {
                return dob
            }
        }

        return null
    }

    const formatDobIso = (dobDate) => {
        const yyyy = dobDate.getFullYear()
        const mm = String(dobDate.getMonth() + 1).padStart(2, '0')
        const dd = String(dobDate.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
    }

    const validationCheck = () => {
        let emailv = /^\S+@\S+\.\S+$/.test(credentials.remail.trim())
        let pwdv = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/.test(credentials.rpassword)
        let cpwdv = credentials.rpassword === credentials.rcpassword ? true : false
        let mbv = /^[0-9]{10}$/.test(credentials.rmobilenumber)
        let fnamev = /^[A-Za-z][A-Za-z\s'-]{1,49}$/.test(credentials.rfirstname.trim())
        let lnamev = /^[A-Za-z][A-Za-z\s'-]{1,49}$/.test(credentials.rlastname.trim())
        const dob = parseDobInput(credentials.rdateofbirth)
        const today = new Date()
        const validDobDate = dob && dob <= today
        const age = validDobDate ? today.getFullYear() - dob.getFullYear() - (
            today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0
        ) : -1
        let dobv = validDobDate && age >= 13 && age <= 100
        let genderv = /^[a-zA-Z]{1,}$/.test(credentials.rgender)
        let statev = credentials.rstate !== 'Select State' ? true : false


        setAlert({
            ...alert, "remail": emailv,
            "rpassword": pwdv,
            "rcpassword": cpwdv,
            "rmobilenumber": mbv,
            "rfirstname": fnamev,
            "rlastname": lnamev,
            "rdateofbirth": dobv,
            "rgender": genderv,
            "rstate": statev
        })
        setInvalid({
            ...invalid, 'remail': emailv ? '' : 'is-invalid',
            'rpassword': pwdv ? '' : 'is-invalid',
            'rcpassword': cpwdv ? '' : 'is-invalid',
            'rmobilenumber': mbv ? '' : 'is-invalid',
            'rfirstname': fnamev ? '' : 'is-invalid',
            'rlastname': lnamev ? '' : 'is-invalid',
            'rdateofbirth': dobv ? '' : 'is-invalid',
            'rgender': genderv ? '' : 'is-invalid',
            'rstate': statev ? '' : 'is-invalid'
        })
        if (emailv && pwdv && cpwdv && mbv && fnamev && lnamev && dobv && genderv && statev) {
            return true
        }
        else {
            return false
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return
        setServerError('')
        var validation = validationCheck()
        if (validation) {
            setIsSubmitting(true)
            try {
                const response = await fetch(`${API_BASE}/auth`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: credentials.remail.trim(),
                        password: credentials.rpassword,
                        countrycode: credentials.rcountrycode,
                        mobilenumber: credentials.rmobilenumber,
                        firstname: credentials.rfirstname.trim(),
                        lastname: credentials.rlastname.trim(),
                        dateofbirth: formatDobIso(parseDobInput(credentials.rdateofbirth)),
                        gender: credentials.rgender,
                        state: credentials.rstate
                    })
                })
                const data = await response.json()
                if (data.success) {
                    localStorage.setItem('auth',JSON.stringify(data));
                    setAuth({...auth,user:data.user,token:data.token})
                    navigate('/');
                } else {
                    setServerError(data?.message || data?.error || 'Unable to create account.')
                }
            } catch (error) {
                setServerError('Unable to reach server. Please try again.')
            } finally {
                setIsSubmitting(false)
            }
        }
    }
    return (
        <div className='lr-con register-page'>
            <div>
                <div className='lr-f-body'>
                    <div className='lr-f-title'>Register</div>
                    <form className='lr-form' onSubmit={handleSubmit}>
                        <div className='part-con'>
                            <div className='part-con-title'>Let's create your credentials</div>
                            <div>
                                <div className='lr-form-item'>
                                    <Input
                                        className="primary"
                                        placeholder='Enter your email address'
                                        onChange={onChangelogin}
                                        value={credentials.remail}
                                        type="email"
                                        name="remail"
                                        id="remail"
                                        validation="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$"
                                        alertmsg="Enter a valid email"
                                    />
                                </div>
                                <div className='lr-form-item d-flex register-two-col-row'>
                                    <Input
                                        className="secondary-mr"
                                        placeholder='Enter your password'
                                        onChange={onChangelogin}
                                        value={credentials.rpassword}
                                        type="password"
                                        name="rpassword"
                                        id="rpassword"
                                        validation="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$"
                                        alertmsg="Use 8+ chars with upper, lower, number, and special character"
                                    />
                                    <Input
                                        className="secondary"
                                        placeholder='Confirm your password'
                                        onChange={onChangelogin}
                                        value={credentials.rcpassword}
                                        type="password"
                                        name="rcpassword"
                                        id="rcpassword"
                                        validation="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$"
                                        alertmsg="Password and confirm password should match"
                                    />
                                </div>
                                <div className='d-flex register-full-row'>
                                    {/* <div className="form-floating">
                                        <input className={`lr-mutli-input-mr form-control`}
                                            placeholder='countrycode'
                                            value={credentials.rcountrycode}
                                            type="text"
                                            name="countrycode"
                                            id="countrycode"
                                            disabled={true}
                                        />
                                        <label className='cd-innput-label' htmlFor="countrycode">Country code</label>
                                    </div> */}
                                    <Input
                                        className="primary"
                                        placeholder='Mobile number'
                                        onChange={onChangelogin}
                                        value={credentials.rmobilenumber}
                                        type="text"
                                        name="rmobilenumber"
                                        id="rmobilenumber"
                                        validation="^[0-9]{10}$"
                                        alertmsg="US mobile number should be 10 digits"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='pd-con part-con'>
                            <div>Your personal details</div>
                            <div>
                                <div className='cred-partition-con d-flex register-two-col-row'>
                                    <div className='lr-form-item'>
                                        <Input
                                            className="secondary-mr"
                                            placeholder='First name'
                                            onChange={onChangelogin}
                                            value={credentials.rfirstname}
                                            type="text"
                                            name="rfirstname"
                                            id="rfirstname"
                                            validation="^[A-Za-z][A-Za-z '-]{1,49}$"
                                            alertmsg="Enter a valid first name"
                                        />
                                    </div>
                                    <div className='lr-form-item'>
                                        <Input
                                            className="secondary"
                                            placeholder='Last name'
                                            onChange={onChangelogin}
                                            value={credentials.rlastname}
                                            type="text"
                                            name="rlastname"
                                            id="rlastname"
                                            validation="^[A-Za-z][A-Za-z '-]{1,49}$"
                                            alertmsg="Enter a valid last name"
                                        />
                                    </div>
                                </div>
                                <div className='d-flex register-two-col-row'>
                                    <Input
                                        className="secondary-mr"
                                        placeholder='Date of birth'
                                        onChange={onChangelogin}
                                        value={credentials.rdateofbirth}
                                        type="date"
                                        name="rdateofbirth"
                                        id="rdateofbirth"
                                        validation="^((19|20)\\d{2}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\\d|3[01])|((0?[1-9]|1[0-2])\\/(0?[1-9]|[12]\\d|3[01])\\/(19|20)\\d{2}))$"
                                        alertmsg="Enter a valid DOB (13+ years)"
                                    />
                                    <div className='radio-con register-gender-con'>
                                        <div className='rc-title'>Gender</div>
                                        <div className='select-radio-con'>
                                            <div className={`form-check select-radio`}>
                                                <input className={`form-check-input select-input  ${invalid.rgender} `}
                                                    onChange={(e) => {
                                                        handleRadio(e)
                                                    }
                                                    }
                                                    checked={credentials.rgender === 'Male'}
                                                    value="Male"
                                                    type="radio"
                                                    name="genderOptions"
                                                    id="male"
                                                    onBlur={() => {
                                                        let regex = /^[a-zA-Z]{1,}$/.test(credentials.rgender)
                                                        setAlert({ ...alert, "rgender": regex })
                                                        setInvalid({ ...invalid, 'rgender': regex ? '' : 'is-invalid' })
                                                    }}
                                                />
                                                <label className="form-check-label select-label" htmlFor="male">
                                                    Male
                                                </label>
                                            </div>
                                            <div className={`form-check select-radio `}>
                                                <input className={`form-check-input select-input  ${invalid.rgender}`}
                                                    onChange={handleRadio}
                                                    type="radio"
                                                    checked={credentials.rgender === 'Female'}
                                                    value="Female"
                                                    name="genderOptions"
                                                    id="female"
                                                    onBlur={() => {
                                                        let regex = /^[a-zA-Z]{1,}$/.test(credentials.rgender)
                                                        setAlert({ ...alert, "rgender": regex })
                                                        setInvalid({ ...invalid, 'rgender': regex ? '' : 'is-invalid' })
                                                    }}
                                                />
                                                <label className="form-check-label select-label" htmlFor="female">
                                                    Female
                                                </label>
                                            </div>
                                        </div>
                                        {alert.rgender === false ? <Alert error={"Please select a gender"} /> : <></>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='wliv-con part-con'>
                            <div>Where do you live ?</div>
                            <div>
                                <Dropdown
                                    className='secondary'
                                    value={credentials.rstate}
                                    onChange={selectState}
                                    options={States}
                                    defaultOption='Select State'
                                />
                                {alert.rstate === false ? <Alert error={"Please select your state you live in"} /> : <></>}
                            </div>
                        </div>
                        <div className='btn-con'>
                            <button className='btn-com btn-com-secondary' disabled={isSubmitting}>
                                {isSubmitting ? 'Creating account...' : 'Create an account'}
                            </button>
                        </div>
                        {serverError ? (
                            <div className='justify-content-center d-flex'>
                                <Alert error={serverError} />
                            </div>
                        ) : null}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register
