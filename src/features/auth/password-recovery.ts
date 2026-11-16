type RecoveryResponse = { message?: string; resetToken?: string };

export function isPasswordRecoveryApiConfigured() {
  return Boolean(process.env.EXPO_PUBLIC_AUTH_API_URL?.trim());
}

function getRecoveryUrl(path: string) {
  const baseUrl = process.env.EXPO_PUBLIC_AUTH_API_URL?.trim().replace(/\/$/, '');
  if (!baseUrl) {
    throw new Error('A recuperação por email ainda não está configurada.');
  }
  return `${baseUrl}${path}`;
}

async function postRecoveryRequest(path: string, body: Record<string, string>): Promise<RecoveryResponse> {
  let response: Response;
  try {
    response = await fetch(getRecoveryUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Não foi possível enviar o código. Tente novamente.');
  }

  const result = await response.json().catch(() => ({})) as RecoveryResponse;
  if (!response.ok) {
    throw new Error(result.message || 'Não foi possível concluir a recuperação.');
  }
  return result;
}

export async function requestPasswordResetCode(email: string) {
  await postRecoveryRequest('/auth/password-reset/request', { email });
}

export async function verifyPasswordResetCode(email: string, code: string) {
  const result = await postRecoveryRequest('/auth/password-reset/verify', { email, code });
  if (!result.resetToken) throw new Error('Código inválido ou expirado. Peça um novo código.');
  return result.resetToken;
}

export async function completePasswordReset(email: string, resetToken: string, password: string) {
  await postRecoveryRequest('/auth/password-reset/complete', { email, resetToken, password });
}
