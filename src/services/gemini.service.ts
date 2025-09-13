import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ParsedListing {
    foodType: string;
    quantity: string;
    donorName: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private backendUrl = 'http://localhost:3000/generate'; // URL of our secure backend

  constructor(private http: HttpClient) {}

  async generateListingDetails(description: string): Promise<ParsedListing | null> {
    const prompt = `
      Parse the following food donation description into a structured JSON object.
      The JSON object should conform to this schema: { "foodType": "string", "quantity": "string", "donorName": "string" }.
      'foodType' should be a general category for the food (e.g., "Baked Goods", "Fresh Produce", "Prepared Meals").
      'quantity' should be the amount of food available (e.g., "2 boxes", "approx. 10 lbs", "15 meals").
      'donorName' should be the name of the restaurant, cafe, or store donating the food.
      Return ONLY the JSON object.

      Description: "${description}"
    `;

    try {
      // Post the prompt to our backend proxy
      const response$ = this.http.post<{ text: string }>(this.backendUrl, { prompt });
      const response = await firstValueFrom(response$);

      // The backend returns a { text: '...' } object. The text is the raw response from Gemini.
      let responseText = response.text.trim();
      
      // Clean the response to ensure it is valid JSON
      // Gemini can sometimes wrap the JSON in ```json ... ```
      if (responseText.startsWith('```json')) {
        responseText = responseText.substring(7, responseText.length - 3).trim();
      } else if (responseText.startsWith('```')) {
         responseText = responseText.substring(3, responseText.length - 3).trim();
      }

      return JSON.parse(responseText) as ParsedListing;

    } catch (error) {
      console.error('Error communicating with backend service:', error);
      return null;
    }
  }
}
