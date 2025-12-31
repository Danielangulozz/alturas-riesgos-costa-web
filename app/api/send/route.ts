import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // 1. Verificamos la llave justo antes de usarla
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "La API Key no está configurada en Vercel" }, { status: 500 });
  }

  // 2. Inicializamos Resend AQUÍ ADENTRO
  const resend = new Resend(apiKey);

  try {
    const { email, nombre, estado } = await req.json();

    const data = await resend.emails.send({
      from: 'AR Costa <onboarding@resend.dev>', 
      to: [email],
      subject: 'Actualización de Documentos - AR Costa',
      html: `<strong>Hola ${nombre}, tu estado es: ${estado}</strong>`,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}