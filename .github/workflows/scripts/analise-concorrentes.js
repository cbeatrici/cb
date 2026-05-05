const fs = require('fs');
const https = require('https');

const prompt = `Acesse e analise a biblioteca de anúncios dos concorrentes da Twygo em:
https://cbeatrici.github.io/cb/twygo-intel.html

Traga:
- Principais gatilhos usados nos anúncios
- Atualizações e novidades identificadas
- Formatos de vídeo utilizados
- Padrões recorrentes de comunicação
- Quais produtos estão em destaque

Seja específico, evite análises genéricas. Aponte padrões concretos.`;

async function chamarClaude() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Iniciando análise...');
  const resposta = await chamarClaude();

  const texto = resposta.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n');

  const data = new Date().toISOString().split('T')[0];
  const conteudo = `# Análise de Concorrentes — ${data}\n\n${texto}`;

  if (!fs.existsSync('relatorios')) fs.mkdirSync('relatorios');
  fs.writeFileSync(`relatorios/analise-${data}.md`, conteudo);
  console.log('Relatório salvo!');
}

main().catch(console.error);
