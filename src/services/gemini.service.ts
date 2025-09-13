
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

// IMPORTANT: This is a placeholder for the API key.
// In a real application, this should be handled securely.
// For now, we'll use a placeholder to prevent errors
const API_KEY = 'placeholder_api_key'; // process.env is not available in browser

export interface ParsedListing {
    foodType: string;
    quantity: string;
    donorName: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if(API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: API_KEY });
    } else {
      console.error("API_KEY environment variable not set.");
    }
  }

  async generateListingDetails(description: string): Promise<ParsedListing | null> {
    if (!this.ai) {
        console.error("Gemini AI client is not initialized.");
        return null;
    }

    const prompt = `
      Parse the following food donation description into a structured JSON object.
      Identify the general category of food, the quantity, and the name of the restaurant or store.
      
      Description: "${description}"
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foodType: {
                type: Type.STRING,
                description: 'A general category for the food (e.g., "Baked Goods", "Fresh Produce", "Prepared Meals").',
              },
              quantity: {
                type: Type.STRING,
                description: 'The amount of food available (e.g., "2 boxes", "approx. 10 lbs", "15 meals").',
              },
              donorName: {
                type: Type.STRING,
                description: 'The name of the restaurant, cafe, or store donating the food.',
              },
            },
            required: ["foodType", "quantity", "donorName"],
          },
        },
      });

      const jsonString = response.text.trim();
      return JSON.parse(jsonString) as ParsedListing;

    } catch (error) {
      console.error('Error generating listing details with Gemini:', error);
      return null;
    }
  }
}
