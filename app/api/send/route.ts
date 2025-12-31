import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Usamos un condicional para que no explote si no hay Key
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function POST(req: Request) {
  if (!resend) {
    return NextResponse.json({ error: "API Key de Resend no configurada" }, { status: 500 });
  }

  try {
    const { email, nombre, estado } = await req.json();

    const data = await resend.emails.send({
      from: 'AR Costa <onboarding@resend.dev>', // Dominio de prueba obligatorio
      to: [email], // RECUERDA: Solo funcionará si 'email' es tu propio correo de admin
      subject: 'Actualización de Documentos',
      html: `<p>Hola ${nombre}, tu estado es: ${estado}</p>`,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}