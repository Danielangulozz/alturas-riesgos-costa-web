import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, nombre, curso, tipo, estado } = await req.json();

    // Personalizamos el mensaje según el tipo de correo
    let subject = "";
    let html = "";

    if (tipo === "bienvenida") {
      subject = `¡Bienvenido a AR Costa Entrenamiento - ${curso}!`;
      html = `<h1>Hola ${nombre}</h1><p>Has sido registrado exitosamente en el curso de <strong>${curso}</strong>. Ya puedes ingresar al portal con tu cédula para subir tus documentos.</p>`;
    } else if (tipo === "estado_docs") {
      subject = `Actualización de tus documentos - AR Costa`;
      html = `<h1>Hola ${nombre}</h1><p>Tu documentación para el curso <strong>${curso}</strong> ha sido marcada como: <strong>${estado}</strong>.</p>`;
    }

    const data = await resend.emails.send({
      from: 'AR Costa <onboarding@resend.dev>', // Luego podrás usar tu propio dominio
      to: [email],
      subject: subject,
      html: html,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}