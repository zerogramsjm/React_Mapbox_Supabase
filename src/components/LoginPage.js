import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

import '../stylesheet/style.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()

  async function handleLogin() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email, 
      password: password});
    if (error) {
      alert(error.message);
    }
    console.log(data)
    if(data.user!==null) {
      navigate('/home')
    }
    setLoading(false);
  }

  return (
    <div className="login-container">
      <h1>Login</h1>
      <div className="form-group">
        <label>Email</label>
        <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
      <p>
        Forgotten Password?<Link to="/forgottenpassword">Click here</Link>
      </p>
      <p>
        Admin?<Link to="/AdminLogin">Click here</Link>
      </p>
    </div>
  );
}

export default LoginPage;
