import React, { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import '../../styles/Auth.css';
import Alert from '../../components/Alert';
import Input from '../../components/Input';
import { useAuth } from '../../context/Auth'
import { useFlight } from '../../context/Flight'

const Login = () => {
    const {auth, setAuth } = useAuth()

    const { alert, setAlert, invalid, setInvalid} = useFlight()

    const navigate = useNavigate();
    const location = useLocation();

    const [credentials, setCredentials] = useState({
        'lemail':'',
        'lpassword':''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [serverError, setServerError] = useState('')

    useEffect(() => {
        // Clear shared form error state when entering login page.
        setAlert((prev) => ({ ...prev, lemail: true, lpassword: true, servermsg: true }));
        setInvalid((prev) => ({ ...prev, lemail: '', lpassword: '' }));
    }, [setAlert, setInvalid]);

    const onChangelogin = (e) => {
        if (serverError) setServerError('')
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }

    const validationCheck = () => {
        let emailv = /^\S+@\S+\.\S+$/.test(credentials.lemail.trim())
        let pwdv = String(credentials.lpassword || '').length >= 1

        setAlert({ ...alert, "lemail": emailv, "lpassword": pwdv })
        setInvalid({ ...invalid, 'lemail': emailv ? '' : 'is-invalid', 'lpassword': pwdv ? '' : 'is-invalid' })

        if (emailv && pwdv) {
            return true
        }
        else {
            return false
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return
        setServerError('')
        let validation = validationCheck()
        if (validation) {
            setIsSubmitting(true)
            try {
                const response = await fetch("https://flightbooking-backend-f0eafuafcpdaavfn.canadacentral-01.azurewebsites.net/api/v1/auth/login", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: credentials.lemail.trim(), password: credentials.lpassword })
                });
                const data = await response.json()
                if (data.success) {
                    localStorage.setItem('auth',JSON.stringify(data));
                    setAuth({...auth,user:data.user,token:data.token})
                    navigate(location.state || '/');
                } else {
                    setServerError('Please try to login with correct credentials.')
                }
            } catch (error) {
                setServerError('Unable to reach server. Please try again.')
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    return (
        <div className='lr-con login-page'>
            <div>
                <div className='lr-f-body'>
                    <div className='lr-f-title'>Log in</div>
                    <form className='lr-form' onSubmit={handleSubmit}>
                        <div className='lr-form-item'>
                            <Input
                                className="primary"
                                placeholder='Enter your email address'
                                onChange={onChangelogin}
                                value={credentials.lemail}
                                type="email"
                                name="lemail"
                                id="lemail"
                                validation="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$"
                                alertmsg="Enter a valid email"
                            />
                        </div>
                        <div className='lr-form-item'>
                            <Input
                                className="primary"
                                placeholder='Enter your password'
                                onChange={onChangelogin}
                                value={credentials.lpassword}
                                type="password"
                                name="lpassword"
                                id="lpassword"
                                validation="^.{1,}$"
                                alertmsg="Password is required"
                            />
                        </div>
                        <div className='justify-content-center d-flex'>
                            {serverError ? <Alert error={serverError} /> : <></>}
                        </div>
                        <div className='lr-form-item'>
                        <div className='d-flex justify-content-around'>
                            <button className='btn-com btn-com-secondary' disabled={isSubmitting}>
                                {isSubmitting ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                        </div>
                    </form>
                    <div className='lr-link-con'>
                        <Link to="/register" className='lr-link-btn'>Don’t have an account yet?</Link>
                        <Link to="/login" className='lr-link-btn'>Forgot your password</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
