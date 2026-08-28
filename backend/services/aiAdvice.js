const MAX_REPLY_WORDS = 500
const MAX_OUTPUT_TOKENS = 1024

function budgetContext(summary) {
  const { income, expense, savings } = summary
  const savingsPct = income > 0 ? ((savings / income) * 100).toFixed(1) : 0
  const expensePct = income > 0 ? ((expense / income) * 100).toFixed(1) : 0

  return `You are BudgetWise AI, a personal finance coach.

User's totals for this month (INR):
- Income: ${income}
- Expense: ${expense}
- Savings: ${savings} (${savingsPct}% of income)
- Spending: ${expensePct}% of income

Rules:
- Answer only what the user asked. Do not add extra topics, tips, or rules they did not ask about.
- Use their numbers above only when they help answer that specific question.
- Do not mention 50/30/20 unless they ask about it or it is directly needed to answer.
- Keep it simple and complete: direct answer first, then only the detail needed for that question.
- Stay focused — no generic lectures, no filler, no "by the way" advice.
- Aim for about 80–200 words unless the question clearly needs more (max ${MAX_REPLY_WORDS} words).
- Always finish with a full sentence. Never stop mid-thought.
- If income is 0 and the question needs income data, say to log income first — nothing else.`
}

async function callGroq(messages) {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY is not set in backend .env')

  let res
  try {
    res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        messages,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.7,
      }),
    })
  } catch (err) {
    throw new Error(
      `Could not reach Groq (${err.message}). On Windows, run: npm run dev — uses --use-system-ca for SSL.`
    )
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Groq request failed')
  return data.choices?.[0]?.message?.content?.trim() || 'No response from Groq'
}

export async function chatWithAi(summary, userMessage, history = []) {
  const messages = [
    { role: 'system', content: budgetContext(summary) },
    ...history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ]

  const reply = await callGroq(messages)
  return { provider: 'groq', reply }
}
