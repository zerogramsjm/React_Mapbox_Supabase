import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/LoginPage';
import AdminLogin from './components/AdminLogin';
import Home from './components/HomePage';
import Registration from './components/RegistrationPage';
import ForgottenPasswordPage from './components/ForgottenPasswordPage';
import RoomPage from './components/RoomPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/forgottenpassword" element={<ForgottenPasswordPage/>} />
        <Route path="/room" element={<RoomPage/>} />
        <Route path="/AdminLogin" element={<AdminLogin/>} />
      </Routes>
    </Router>
  );
}

export default App;
