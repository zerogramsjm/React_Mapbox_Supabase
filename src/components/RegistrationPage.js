import { useState } from 'react';
import { supabase } from '../supabaseClient';

import { Link } from 'react-router-dom';

import '../stylesheet/style.css';

function RegistrationPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegistration() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      alert('Please check your email to verify your account!');
    }
    setLoading(false);
  }

  return (
    <div className="registration-container">
      <h1>Registration</h1>
      <div className="form-group">
        <label>Email</label>
        <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={handleRegistration} disabled={loading}>
        {loading ? 'Loading...' : 'Register'}
      </button>
      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default RegistrationPage;
