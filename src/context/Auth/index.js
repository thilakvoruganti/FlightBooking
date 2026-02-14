import React,{ createContext, useContext, useState , useEffect} from 'react'
import axios from 'axios'

const AuthContent = createContext()


const AuthProvider = (props) => {

  const [auth, setAuth] = useState({
    user:null,
    token:'',
  })

  axios.defaults.baseURL = "https://flightbooking-backend-f0eafuafcpdaavfn.canadacentral-01.azurewebsites.net/api/v1"
  axios.defaults.headers.common['auth-token'] = auth?.token


  useEffect(() => {
    const data = localStorage.getItem('auth');
    if (data) {
      let parsed = JSON.parse(data);
      setAuth({ user: parsed.user, token: parsed.token });
    }
  }, [setAuth]);

  return (
    <AuthContent.Provider value={{auth, setAuth }}>
        {props.children}
    </AuthContent.Provider>
  )
}

const useAuth = () => useContext(AuthContent)

export { useAuth, AuthProvider}
