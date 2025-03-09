import dotenv from 'dotenv';
import dayjs from 'dayjs';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number
  ) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

class WeatherService {
  private baseURL: string;
  private apiKey: string;
  private cityName: string = '';

  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org';
    this.apiKey = process.env.API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Warning: API_KEY not set in environment variables');
    }
  }

  // Fetch location data (coordinates) for a city
  private async fetchLocationData(query: string): Promise<any> {
    try {
      const geocodeQuery = this.buildGeocodeQuery(query);
      console.log('Geocode API URL:', geocodeQuery);
      
      const response = await fetch(geocodeQuery);
      
      if (!response.ok) {
        throw new Error(`Error fetching location data: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Location data:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchLocationData:', error);
      throw error;
    }
  }

  // Extract coordinates from location data
  private destructureLocationData(locationData: any[]): Coordinates {
    if (!locationData || !locationData.length) {
      throw new Error('No location data found');
    }
    
    const { lat, lon } = locationData[0];
    return { lat, lon };
  }

  // Build geocoding API URL
  private buildGeocodeQuery(query: string): string {
    return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`;
  }

  // Build weather API URL
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
  }

  // Fetch and extract location data
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    console.log(`Fetching location data for city: ${this.cityName}`);
    const locationData = await this.fetchLocationData(this.cityName);
    const coordinates = this.destructureLocationData(locationData);
    console.log(`Coordinates for ${this.cityName}:`, coordinates);
    return coordinates;
  }

  // Fetch weather data using coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    try {
      const weatherQuery = this.buildWeatherQuery(coordinates);
      console.log('Weather API URL:', weatherQuery);
      
      const response = await fetch(weatherQuery);
      
      if (!response.ok) {
        throw new Error(`Error fetching weather data: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Weather data (first 200 chars):', JSON.stringify(data).substring(0, 200) + '...');
      return data;
    } catch (error) {
      console.error('Error in fetchWeatherData:', error);
      throw error;
    }
  }

  // Parse current weather data
  private parseCurrentWeather(response: any): Weather {
    console.log('Parsing current weather from:', response.city.name);
    
    if (!response || !response.city || !response.list || !response.list.length) {
      console.error('Invalid response format:', response);
      throw new Error('Invalid weather data format');
    }
    
    const cityName = response.city.name;
    const currentDay = response.list[0];
    
    if (!currentDay || !currentDay.weather || !currentDay.weather.length) {
      console.error('Invalid current day data:', currentDay);
      throw new Error('Invalid current day weather data');
    }
    
    return new Weather(
      cityName,
      dayjs(currentDay.dt_txt).format('MM/DD/YYYY'),
      currentDay.weather[0].icon,
      currentDay.weather[0].description,
      Math.round(currentDay.main.temp),
      Math.round(currentDay.wind.speed),
      Math.round(currentDay.main.humidity)
    );
  }

  // Build 5-day forecast array
  private buildForecastArray(currentWeather: Weather, weatherData: any): Weather[] {
    console.log('Building forecast array');
    const forecastArray: Weather[] = [currentWeather];
    const city = weatherData.city.name;
    
    // Get unique dates for the 5-day forecast
    const uniqueDates = new Set<string>();
    const tomorrow = dayjs().add(1, 'day').startOf('day');
    
    weatherData.list.forEach((item: any) => {
      const date = dayjs(item.dt_txt);
      // Only add if it's a future date and we're looking at the noon forecast
      if (date.isAfter(tomorrow) && date.hour() === 12) {
        uniqueDates.add(date.format('MM/DD/YYYY'));
      }
    });
    
    console.log('Unique forecast dates:', Array.from(uniqueDates));
    
    // Filter to get one forecast per day at noon
    const dailyForecasts = weatherData.list.filter((item: any) => {
      const date = dayjs(item.dt_txt);
      const dateStr = date.format('MM/DD/YYYY');
      
      if (uniqueDates.has(dateStr) && date.hour() === 12) {
        uniqueDates.delete(dateStr); // Remove date once used
        return true;
      }
      return false;
    });
    
    console.log(`Found ${dailyForecasts.length} daily forecasts`);
    
    // Build forecast objects (maximum 5 days)
    dailyForecasts.slice(0, 5).forEach((forecast: any) => {
      forecastArray.push(
        new Weather(
          city,
          dayjs(forecast.dt_txt).format('MM/DD/YYYY'),
          forecast.weather[0].icon,
          forecast.weather[0].description,
          Math.round(forecast.main.temp),
          Math.round(forecast.wind.speed),
          Math.round(forecast.main.humidity)
        )
      );
    });
    
    console.log(`Generated ${forecastArray.length} weather objects (current + forecast)`);
    return forecastArray;
  }

  // Get weather data for a city
  async getWeatherForCity(city: string): Promise<Weather[]> {
    try {
      console.log(`Getting weather for: ${city}`);
      this.cityName = city;
      
      // Get coordinates for the city
      const coordinates = await this.fetchAndDestructureLocationData();
      
      // Get weather data using the coordinates
      const weatherData = await this.fetchWeatherData(coordinates);
      
      // Check if data has expected structure
      if (!weatherData || !weatherData.city || !weatherData.list || !weatherData.list.length) {
        console.error('Invalid weather data format:', weatherData);
        throw new Error('Invalid weather data format received from API');
      }
      
      // Parse current weather
      const currentWeather = this.parseCurrentWeather(weatherData);
      
      // Build forecast array (current + 5 days)
      return this.buildForecastArray(currentWeather, weatherData);
    } catch (error) {
      console.error('Error in getWeatherForCity:', error);
      throw error;
    }
  }
}

export default new WeatherService();