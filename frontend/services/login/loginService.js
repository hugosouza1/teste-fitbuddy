import { Platform } from 'react-native';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export async function loginUser(email, senha) {
  if (!email || !senha) {
    return {
      ok: false,
      error: 'Email e senha são obrigatórios',
    };
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: senha }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      return {
        ok: false,
        error: data?.error || 'Falha ao fazer login',
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