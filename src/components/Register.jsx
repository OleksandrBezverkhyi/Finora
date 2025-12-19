import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.includes('@')) {
      setError('Некоректний email');
      return;
    }
    if (password.length < 6) {
      setError('Пароль повинен бути не менше 6 символів');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess('Користувач успішно зареєстрований');
        setEmail('');
        setPassword('');
        setRole('user');
      } else {
        setError(data.message);
      }
    } catch {
      setError('Помилка сервера');
    }
  };

  return (
    <div className="register-container">
      <h2>Реєстрація</h2>
      <form onSubmit={handleSubmit}>
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
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <button type="submit">Зареєструватися</button>
      </form>
      <button className="login-btn" onClick={() => navigate('/login')}>
        Увійти
      </button>
    </div>
  );
}
