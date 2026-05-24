/**
 * CreativeOps — Claude API Proxy
 * Vercel API Route: /api/claude
 *
 * 역할: 브라우저 → 이 프록시 → Anthropic API
 * CORS 문제를 서버 사이드에서 해결합니다.
 */

module.exports = async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  // Preflight 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST만 허용
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Claude API 키 (Admin에서 입력 → 프론트 → 헤더로 전달)
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    res.status(401).json({
      error: 'Claude API 키가 없습니다. Admin 페이지에서 API 키를 입력해주세요.'
    });
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
