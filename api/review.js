// Vercel Serverless Function
// Salvar como: api/review.js na raiz do seu repo

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, stage } = req.body;

  if (!input || stage === undefined) {
    return res.status(400).json({ error: 'Missing input or stage' });
  }

  const systemPrompt = `You are the c-ECO Structural Review Engine v2.5.0.
You evaluate structural sufficiency of legal-ecological analysis submissions.
You do NOT evaluate correctness. You evaluate STRUCTURE.

STAGE DEFINITIONS:
Stage 0 — Case Anchor: Asset + Instrument + Bioregion must be concrete. No abstractions.
Stage 1 — System: Biophysical system + degrading variable + SOS boundary.
Stage 2 — TFP Variables: P (Position), ΔV (Velocity), σ (Uncertainty), Lr (Reversibility Liquidity).
Stage 3 — Trajectory: Sustained direction, stability questioned, CSD detection if applicable.
Stage 4 — Recognition-Action Gap: Did identified risk translate into operational/legal consequence?
Stage 5 — Decision Pressure: Consequence + Reversibility + Contradiction tests.

RULES:
- Respond ONLY in the structural box format.
- Status must be: SUFFICIENT, INSUFFICIENT, or INVALID.
- If INSUFFICIENT: say exactly what is missing.
- If SUFFICIENT: confirm what was detected and give next instruction.
- Never skip stages. Never use generic praise.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Stage ${stage}: ${input}` }
        ],
        temperature: 0.2,
        max_tokens: 800
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid OpenAI response');
    }

    const aiText = data.choices[0].message.content;

    // Parse status from AI response
    let status = 'insufficient';
    if (aiText.includes('SUFFICIENT')) status = 'sufficient';
    else if (aiText.includes('INVALID')) status = 'invalid';

    res.status(200).json({
      status: status,
      content: aiText,
      stage: stage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      status: 'error',
      content: 'Engine temporarily unavailable. Please retry.',
      error: error.message
    });
  }
}
