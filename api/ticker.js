export default function handler(req, res) {
  res.status(200).json({
    messages: [
      "Disciplina gana al talento.",
      "Acción > Intención.",
      "Dormir bien es dopaje legal.",
      "Pequeñas victorias suman.",
      "Lo que no se mide, no crece.",
      "Enfoque total. Sin ruido.",
      "Nunca olvides quien eres!",
      "No hay camino mas directo al fracaso que mentirte a ti mismo."
    ]
  });
}
