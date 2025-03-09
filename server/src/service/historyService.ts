import fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

// Define a City class with name and id properties
export class City {
  id: string;
  name: string;

  constructor(name: string, id: string = uuidv4()) {
    this.name = name;
    this.id = id;
  }
}

class HistoryService {
  private dbPath: string;

  constructor() {
    // Get path to db.json
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.dbPath = path.join(__dirname, '../../db/db.json');
  }

  // Read from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      return JSON.parse(data) as City[];
    } catch (error) {
      // If file doesn't exist or is empty, return empty array
      return [];
    }
  }

  // Write the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    await fs.writeFile(this.dbPath, JSON.stringify(cities, null, 2));
  }

  // Get all cities from the searchHistory.json file
  async getCities(): Promise<City[]> {
    return await this.read();
  }

  // Add a city to the searchHistory.json file
  async addCity(cityName: string): Promise<City> {
    const cities = await this.read();
    
    // Check if city already exists
    const existingCity = cities.find(city => city.name.toLowerCase() === cityName.toLowerCase());
    
    if (existingCity) {
      return existingCity;
    }
    
    // Create new city
    const newCity = new City(cityName);
    cities.push(newCity);
    
    await this.write(cities);
    return newCity;
  }

  // Remove a city from the searchHistory.json file
  async removeCity(id: string): Promise<boolean> {
    const cities = await this.read();
    const initialLength = cities.length;
    
    const filteredCities = cities.filter(city => city.id !== id);
    
    if (filteredCities.length === initialLength) {
      return false; // City not found
    }
    
    await this.write(filteredCities);
    return true;
  }
}

export default new HistoryService();