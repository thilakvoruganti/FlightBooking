import { Route, BrowserRouter, Routes } from 'react-router-dom';
import './App.css';
import BookingSummary from './pages/BookingSummary';
import Confirmationpage from './pages/Confirmationpage';
import Dashboard from './pages/Dashboard';
import FetchBooking from './pages/FetchBooking';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Navbar from './pages/Navbar';
import OnewaySearch from './pages/OnewaySearch';
import Passengerdetails from './pages/Passengerdetails';
import PaymentCancel from './pages/PaymentCancel';
import PaymentSuccess from './pages/PaymentSuccess';
import Register from './pages/Auth/Register';
import ReturnSearch from './pages/ReturnSearch';
// import FlightState from './context/FlightState';
import { AuthProvider } from './context/Auth';
import { FlightProvider } from './context/Flight';
import PrivateRoute from './components/routes/PrivateRoute';



function App() {
  return (
    <>
      <AuthProvider>
        <FlightProvider>
        {/* <FlightState> */}
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/login" element={<Login />} />
              <Route exact path="/register" element={<Register />} />
              <Route exact path="/dashboard" element={<PrivateRoute />} >
                <Route exact path="" element={<Dashboard />} />
                <Route exact path="fetchbooking/:slug" element={<FetchBooking />} />
                <Route exact path="bookingsummary" element={<BookingSummary />} />
                <Route exact path="confirmation/:slug" element={<Confirmationpage />} />
                <Route exact path="payment/success" element={<PaymentSuccess />} />
                <Route exact path="payment/cancel" element={<PaymentCancel />} />
              </Route>
              <Route exact path="/owsearch/:slug" element={<OnewaySearch />} />
              <Route exact path="/rsearch/:slug" element={<ReturnSearch />} />
              <Route exact path="/passengerdetails" element={<Passengerdetails />} />
            </Routes>
          </BrowserRouter>
        {/* </FlightState> */}
        </FlightProvider>
      </AuthProvider>
    </>
  );
}

export default App;
