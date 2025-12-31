import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, nombre, estado } = body;

    // VALIDACIÓN IMPORTANTE
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Falta la API KEY en Vercel" }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: 'AR Costa <onboarding@resend.dev>', // No cambies esto hasta tener dominio propio
      to: [email], // Si es cuenta gratuita, solo funcionará con TU email
      subject: 'Actualización de Estado - AR Costa',
      html: `
        <h1>Hola ${nombre}</h1>
        <p>Te informamos que tu estado en el sistema es: <strong>${estado}</strong></p>
        <p>Saludos,<br/>Equipo AR Costa</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}