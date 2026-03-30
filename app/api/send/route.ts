import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Escape HTML para evitar inyección de código en el email
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Validación simple de email
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'La API Key no está configurada en el servidor' },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
  }

  // Validar estructura y tipos
  if (
    typeof body !== 'object' || body === null ||
    !('email' in body) || !('nombre' in body) || !('estado' in body)
  ) {
    return NextResponse.json({ error: 'Faltan campos requeridos: email, nombre, estado' }, { status: 400 });
  }

  const { email, nombre, estado } = body as Record<string, unknown>;

  if (typeof email !== 'string' || !isValidEmail(email)) {
    return NextResponse.json({ error: 'El campo email no es válido' }, { status: 400 });
  }
  if (typeof nombre !== 'string' || nombre.trim().length === 0 || nombre.length > 100) {
    return NextResponse.json({ error: 'El campo nombre no es válido (máx 100 caracteres)' }, { status: 400 });
  }
  if (typeof estado !== 'string' || estado.trim().length === 0 || estado.length > 200) {
    return NextResponse.json({ error: 'El campo estado no es válido (máx 200 caracteres)' }, { status: 400 });
  }

  // Sanitizar antes de usar en HTML
  const safeName = escapeHtml(nombre.trim());
  const safeEstado = escapeHtml(estado.trim());

  const resend = new Resend(apiKey);

  try {
    const data = await resend.emails.send({
      from: 'AR Costa <onboarding@resend.dev>',
      to: [email],
      subject: 'Actualización de Documentos - AR Costa',
      html: `<strong>Hola ${safeName}, tu estado es: ${safeEstado}</strong>`,
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
