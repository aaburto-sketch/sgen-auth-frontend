import { useState } from 'react';
import './index.css';

const API_KEY = import.meta.env.VITE_GCIP_API_KEY || '';

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [rfcMaestro, setRfcMaestro] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true })
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error.message);

        setMessage('¡Login Exitoso! JWT Obtenido. ' + data.idToken.substring(0, 20) + '...');

        const meRes = await fetch('http://localhost:3000/api/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${data.idToken}` }
        });
        const meData = await meRes.json();
        console.log('Datos del Backend:', meData);

      } else {
        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true })
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error.message);

        const idToken = data.idToken;

        const backRes = await fetch('http://localhost:3000/api/v1/auth/register-tenant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            nombreCompleto,
            razonSocial,
            rfcMaestro
          })
        });
        const backData = await backRes.json();

        if (!backRes.ok) {
          // Compensating transaction: Delete GCIP user on local DB failure
          await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
          });
          throw new Error(backData.message || 'Error en Base de Datos. Registro revertido exitosamente.');
        }

        setMessage('¡Registro exitoso en Google y en Base de Datos!');
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '500px', margin: '4rem auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>SGEn Auth</h1>

      {!API_KEY && (
        <div style={{ background: 'rgba(255,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          ⚠️ Falta configurar <strong>VITE_GCIP_API_KEY</strong> en el archivo .env
        </div>
      )}

      <div className="tab-container">
        <div className={`tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>
          Iniciar Sesión
        </div>
        <div className={`tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>
          Registrarse
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="input-field"
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="input-field"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {!isLogin && (
          <>
            <input
              className="input-field"
              type="text"
              placeholder="Nombre Completo"
              value={nombreCompleto}
              onChange={e => setNombreCompleto(e.target.value)}
              required={!isLogin}
            />
            <input
              className="input-field"
              type="text"
              placeholder="Razón Social (Ej: Empresa S.A.)"
              value={razonSocial}
              onChange={e => setRazonSocial(e.target.value)}
              required={!isLogin}
            />
            <input
              className="input-field"
              type="text"
              placeholder="RFC Maestro (12 o 13 caracteres)"
              value={rfcMaestro}
              onChange={e => setRfcMaestro(e.target.value)}
              required={!isLogin}
              minLength={12}
              maxLength={13}
            />
          </>
        )}

        <button className="btn-primary" type="submit" disabled={loading || !API_KEY}>
          {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrar')}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', wordBreak: 'break-all' }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default App;
