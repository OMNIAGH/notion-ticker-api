export default async function handler(req, res) {
  const token = process.env.NOTION_TOKEN;
  const dbId  = process.env.NOTION_DB_ID;

  if (!token || !dbId) {
    return res.status(500).json({ error: "Missing NOTION_TOKEN or NOTION_DB_ID" });
  }

  try {
    const body = {
      filter: { property: "Activo", checkbox: { equals: true } },
      sorts: [{ property: "Prioridad", direction: "descending" }],
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

    const messages = json.results.map(page => {
      const f = page.properties?.Frase;
      const parts = f?.title || f?.rich_text || [];
      return parts.map(x => x.plain_text).join("");
    }).filter(Boolean);

    res.status(200).json({ messages });

  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}