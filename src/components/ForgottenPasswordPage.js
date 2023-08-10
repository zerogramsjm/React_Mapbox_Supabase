import { useState } from 'react';
import { supabase } from '../supabaseClient';

import { Link } from 'react-router-dom';

import '../stylesheet/style.css';

function ForgottenPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleResetPassword() {
    setLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3000/update-password',
    })
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Please check your email to reset your password.');
    }
    setLoading(false);
  }

  return (
    <div className="login-container">
      <h1>Forgot Password</h1>
      <div className="form-group">
        <label>Email</label>
        <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={handleResetPassword} disabled={loading}>
        {loading ? 'Loading...' : 'Reset Password'}
      </button>
      <p>
        Remember your password? <Link to="/">Log in</Link>
      </p>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default ForgottenPasswordPage;
