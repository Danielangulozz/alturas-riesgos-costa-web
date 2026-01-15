export default function GoogleMapsEmbed() {
  return (
    <div className="w-full h-full min-h-[400px] rounded-[2rem] overflow-hidden shadow-xl border border-slate-200">
      <iframe 
        // 👇 AQUÍ PEGAS TU LINK REAL DE GOOGLE MAPS
        // Para obtenerlo: Ve a Google Maps -> Busca tu negocio -> Botón "Compartir" -> "Insertar un mapa" -> Copia solo lo que está dentro de src="..."
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3937.4061403509354!2d-75.39768648988856!3d9.29723388469503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e59159a52a5a81f%3A0xf1747b558ae6ced8!2sAlturas%20y%20Riesgos%20de%20la%20Costa%20SAS!5e0!3m2!1ses-419!2sco!4v1768509047539!5m2!1ses-419!2sco"
        width="100%" 
        height="100%" 
        style={{ border: 0 }} 
        allowFullScreen={true} 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
      ></iframe>
    </div>
  );
}