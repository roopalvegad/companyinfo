export async function extractCompanyInfo(companies: string[]) {
  const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;
  
  if (!PERPLEXITY_API_KEY) {
    throw new Error('Perplexity API key is not configured');
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides accurate information about companies. Always respond with clean JSON without any markdown formatting or code blocks. Use exactly the field names provided in the request.'
          },
          {
            role: 'user',
            content: `Return information about these companies: ${companies.join(', ')}. 
                     
                     Respond with a JSON object where:
                     1. Each company name is a key in the main object
                     2. Each company's value is an object with EXACTLY these field names:
                        - description (a brief company description)
                        - industry (main industry sector)
                        - products_services (main products or services)
                        - headquarters (headquarters location)
                        - year_founded (founding year)
                     
                     Example format:
                     {
                       "Apple Inc.": {
                         "description": "A technology company that designs and develops consumer electronics",
                         "industry": "Technology",
                         "products_services": "iPhone, iPad, Mac computers, Apple Watch, Services",
                         "headquarters": "Cupertino, California, USA",
                         "year_founded": "1976"
                       }
                     }
                     
                     Important:
                     - Do not include any markdown formatting
                     - Use exactly the field names shown above
                     - Return only the JSON object, nothing else`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Success Response:', data);
    return data;
  } catch (error) {
    console.error('Error extracting company information:', error);
    if (error instanceof Error) {
      throw new Error(`API Error: ${error.message}`);
    }
    throw error;
  }
} 