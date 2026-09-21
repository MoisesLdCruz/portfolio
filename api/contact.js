export default async function handler(req, res) {
  // CORS básico para o próprio domínio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, type, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não configurados');
    return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
  }

  const typeLabels = {
    site: 'Site Institucional / Landing Page',
    sistema: 'Sistema de Gestão / Plataforma Interna',
    app: 'Aplicativo Móvel',
    ecommerce: 'Loja Virtual / E-commerce',
    outro: 'Outra Solução Personalizada'
  };

  const typeLabel = typeLabels[type] || type || 'Não especificado';

  const text =
    `🚀 *Nova mensagem do portfólio*\n\n` +
    `👤 *Nome:* ${escapeMarkdown(name)}\n` +
    `📧 *Email:* ${escapeMarkdown(email)}\n` +
    `🔧 *Tipo de solução:* ${escapeMarkdown(typeLabel)}\n\n` +
    `💬 *Mensagem:*\n${escapeMarkdown(message)}`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });

    const data = await tgRes.json();

    if (!tgRes.ok || !data.ok) {
      console.error('Telegram API error:', data);
      return res.status(500).json({ error: 'Falha ao enviar a mensagem.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erro ao processar formulário:', err);
    return res.status(500).json({ error: 'Erro interno ao processar a mensagem.' });
  }
}

function escapeMarkdown(text) {
  return String(text)
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/`/g, '\\`');
}
