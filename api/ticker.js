export default async function handler(req, res) {
  const token = process.env.NOTION_TOKEN;
  const dbId  = process.env.NOTION_DB_ID;

  if (!token || !dbId) {
    return res.status(500).json({ error: "Missing NOTION_TOKEN or NOTION_DB_ID" });
  }

  try {
    const body = {
      // 👇 QUITÉ EL FILTRO POR "Activo" PARA NO LIARLA MÁS
      // Si luego quieres reactivar el filtro, lo hacemos, pero primero que funcione.
      page_size: 100
    };

    const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const json = await r.json();

    // 1) Sacar textos de la columna "Frase" o del título que haya
    const raw = (json.results || []).flatMap(page => {
      const props = page.properties || {};
      const f = props.Frase;

      let txt = "";

      if (f && f.type === "title") {
        txt = (f.title || []).map(x => x.plain_text).join("");
      } else {
        const anyTitle = Object.values(props).find(p => p.type === "title");
        if (anyTitle) {
          txt = (anyTitle.title || []).map(x => x.plain_text).join("");
        }
      }

      txt = String(txt || "").trim();
      if (!txt) return [];

      // 2) Si alguien metió varias frases en una sola celda separadas por rayas, las partimos
      const parts = txt
        .split(/[-—]{2,}/g)   // "——", "-----", etc
        .map(s => s.trim())
        .filter(Boolean);

      return parts.length ? parts : [txt];
    });

    // 3) Quitar duplicados
    const seen = new Set();
    const messages = [];
    for (const m of raw) {
      const t = String(m || "").trim();
      if (!t) continue;
      if (seen.has(t)) continue;
      seen.add(t);
      messages.push(t);
    }

    return res.status(200).json({ messages });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
