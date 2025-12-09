import { Platform } from 'react-native';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export async function registerUser(email, password, name){
    if (!email || !password || !name){
        return {
          ok: false,
          error: 'Email e password são obrigatórios',
        };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      return {
        ok: false,
        error: data?.error || 'Falha ao fazer registro',
      };
    }
    return {
      ok: true,
      data: data,
      email: data.email || email.trim(),
    };
  } catch (err) {
    return {
      ok: false,
      error: 'Erro de conexão: ' + (err.message || 'Tente novamente'),
    };
  }

}

