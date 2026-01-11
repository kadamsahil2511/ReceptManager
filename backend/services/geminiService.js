import { getVisionModel, getChatModel } from '../config/gemini.js';

const RECEIPT_ANALYSIS_PROMPT = `You are an expert receipt analyzer. Analyze this receipt image carefully and extract all relevant information.

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just pure JSON):
{
  "storeName": "Store/Company Name",
  "purchaseDate": "YYYY-MM-DD",
  "totalAmount": 0.00,
  "currency": "INR",
  "warrantyExpiryDate": "YYYY-MM-DD",
  "isRecurring": false,
  "recurringFrequency": null,
  "items": [
    {
      "name": "Item name",
      "quantity": 1,
      "price": 0.00,
      "category": "category"
    }
  ],
  "tags": ["tag1", "tag2"]
}

Important rules:
1. If warranty is not mentioned, infer 1 year from purchase date for electronics/appliances, 6 months for others
2. Set isRecurring to true if it's a subscription, utility bill, or recurring service
3. recurringFrequency should be: "weekly", "monthly", "quarterly", "yearly", or null
4. Extract ALL items with their prices
5. Use appropriate categories: "electronics", "groceries", "clothing", "food", "services", "utilities", "subscription", "other"
6. Add relevant tags based on content
7. For Indian receipts, currency should be "INR"
8. Dates must be in ISO format (YYYY-MM-DD)`;

export const analyzeReceiptImage = async (imageBuffer, mimeType) => {
  const model = getVisionModel();
  
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType
    }
  };

  try {
    const result = await model.generateContent([RECEIPT_ANALYSIS_PROMPT, imagePart]);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON
    const receiptData = JSON.parse(text);
    
    return {
      success: true,
      data: receiptData,
      rawText: text
    };
  } catch (error) {
    console.error('Gemini Vision Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const chatWithContext = async (userMessage, context = null, conversationHistory = []) => {
  const model = getChatModel();
  
  let systemPrompt = `You are a helpful assistant for a Smart Receipt & Warranty Tracker app. 
You help users manage their receipts, track warranties, and find information about their purchases.
Be concise, friendly, and helpful. Use emojis sparingly for a modern feel.

Current date: ${new Date().toISOString().split('T')[0]}`;

  if (context) {
    systemPrompt += `\n\nContext from user's receipts:\n${JSON.stringify(context, null, 2)}`;
  }

  const chat = model.startChat({
    history: conversationHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    })),
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  try {
    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${userMessage}`);
    const response = await result.response;
    return {
      success: true,
      message: response.text()
    };
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const searchForSupport = async (productName) => {
  // If Serper API is available, use it for Google Search
  if (process.env.SERPER_API_KEY) {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: `${productName} official support page customer service`,
          num: 5
        })
      });
      
      const data = await response.json();
      return {
        success: true,
        results: data.organic?.slice(0, 3) || []
      };
    } catch (error) {
      console.error('Serper Search Error:', error);
    }
  }
  
  // Fallback: Use Gemini to provide general support info
  const model = getChatModel();
  try {
    const result = await model.generateContent(
      `Provide the official support website and customer service information for "${productName}". 
      Include phone numbers if commonly known. Be concise.`
    );
    return {
      success: true,
      message: result.response.text()
    };
  } catch (error) {
    return {
      success: false,
      error: 'Could not find support information'
    };
  }
};
