export interface CompanyInfo {
  name: string;
  description: string;
  industry: string;
  products_services: string;
  headquarters: string;
  year_founded: string | number;
}

export interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string; // This will be our JSON string containing company info
    };
  }>;
} 