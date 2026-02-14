import React,{useState, useEffect} from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/Auth'
import Loader from './Loader'


const PrivateRoute = () => {
    const {auth} = useAuth()
    const [ok,setOk] = useState(false)
    useEffect(() => {
        if (auth?.token) {
            setOk(true);
        } else {
            setOk(false);
        }
    }, [auth?.token]);

  return ok?<Outlet/>:<Loader/>
}

export default PrivateRoute