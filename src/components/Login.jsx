import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
      } else {
        setError(data.message);
      }

      if (res.ok) {
        if (data.role === 'admin') navigate('/admin');
        else navigate('/user');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Помилка сервера');
    }
  };

  return (
    <div className="login-container">
      <h2>Авторизація</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit">Увійти</button>
      </form>
      <button className="register-btn" onClick={() => navigate('/register')}>
        Зареєструватися
      </button>
    </div>
  );
}

export default Login;
