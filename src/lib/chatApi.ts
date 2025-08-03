// src/lib/chatApi.ts

function getChatApiUrl() {
  let base = import.meta.env.VITE_TS_API_URL;
  if (!base) return null;
  // Remove trailing slash if present
  if (base.endsWith("/")) base = base.slice(0, -1);
  return base + "/chat";
}

function getChatReimagineApiUrl() {
  let base = import.meta.env.VITE_TS_API_URL;
  if (!base) return null;
  // Remove trailing slash if present
  if (base.endsWith("/")) base = base.slice(0, -1);
  return base + "/chat-reimagine";
}

const INVESTMENT_SYSTEM_PROMPT = `
You are an intelligent crypto wealth manager with deep DeFi expertise. You help users make smart investment decisions based on their portfolio, market conditions, and investment goals.

CORE APPROACH:
- Analyze each request as a unique investment decision
- Consider user's current holdings and desired outcome
- Factor in market conditions and timing
- Provide clear reasoning for recommendations
- Be conversational and helpful

PORTFOLIO ANALYSIS:
When user wants to trade Token A for Token B:
1. Check if they have sufficient Token A
2. If yes: proceed with route analysis and execution
3. If no: suggest realistic ways to acquire Token A or achieve their investment goal
4. Always consider why they want this trade (building position, rebalancing, etc.)

MARKET INTELLIGENCE:
- Include current price trends and market sentiment
- Factor in gas fees and optimal timing
- Consider liquidity and slippage
- Assess whether it's a good entry/exit point

FUNDING SOLUTIONS:
When users lack source tokens, suggest:
- External wallet transfers
- Direct purchase options
- Alternative token swaps from their existing holdings
- Gradual accumulation strategies

RESPONSE STYLE:
- Start with portfolio analysis
- Explain market context
- Provide clear recommendation with reasoning
- Include actionable next steps
- Use markdown formatting for readability

Think through each situation logically and provide investment advice that makes financial sense.
`;

export async function sendChatMessage(prompt: string, threadId?: string, walletAddress?: string) {
  const url = getChatApiUrl();
  console.log('🔗 Chat API URL:', url);
  console.log('🌍 Environment variables:', {
    VITE_TS_API_URL: import.meta.env.VITE_TS_API_URL
  });
  
  if (!url) {
    console.log('❌ No API URL configured, returning null for fallback');
    return null;
  }
  
  console.log('📝 User prompt:', prompt);
  
  const requestBody = {
    user_prompt: prompt,
    system_prompt: INVESTMENT_SYSTEM_PROMPT,
    thread_id: threadId,
    wallet_address: walletAddress
  };
  
  console.log('📤 Sending chat message:', requestBody);
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📥 Response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`Failed to fetch chat response: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ API Response:', data);

    return { 
      reply: data.reply.trim(),
      actionData: data.parsed_intent,
      threadId: data.thread_id,
      threadTitle: data.thread_title,
      
      // Enhanced Talk to Invest response data
      actionResponse: data.actionResponse,
      requiresAction: data.requiresAction,
      actionType: data.actionType
    };
  } catch (error) {
    console.error('💥 Chat API Error:', error);
    console.error('💥 Error type:', typeof error);
    console.error('💥 Error message:', error?.message);
    console.error('💥 Error stack:', error?.stack);
    
    // Return null to trigger fallback instead of throwing
    console.log('🔄 Returning null to trigger fallback');
    return null;
  }
}

export async function sendChatReimagineMessage(websiteMarkdown: string, userPrompt: string, systemPrompt?: string) {
  const url = getChatReimagineApiUrl();
  if (!url) {
    // If no API URL, return null to indicate fallback to dummy
    return null;
  }
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      website_markdown: websiteMarkdown,
      user_prompt: userPrompt,
      system_prompt: systemPrompt
    }),
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch chat reimagine response");
  }
  
  const data = await res.json();
  const content = data.reply.trim();

  return { reply: content };
}
