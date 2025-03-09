import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  try {
    const { cityName } = req.body;
    
    if (!cityName) {
      return res.status(400).json({ error: 'City name is required' });
    }
    
    // Get weather data for the city
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    
    // Save city to search history
    await HistoryService.addCity(cityName);
    
    // Return weather data
    return res.status(200).json(weatherData);
  } catch (error) {
    console.error('Error in weather POST route:', error);
    return res.status(500).json({ error: 'Failed to retrieve weather data' });
  }
});

// GET search history
router.get('/history', async (_req, res) => {
  try {
    const cities = await HistoryService.getCities();
    return res.status(200).json(cities);
  } catch (error) {
    console.error('Error in history GET route:', error);
    return res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (_req, res) => {
  try {
    const { id } = _req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'City ID is required' });
    }
    
    const success = await HistoryService.removeCity(id);
    
    if (!success) {
      return res.status(404).json({ error: 'City not found in search history' });
    }
    
    return res.status(200).json({ message: 'City removed from search history' });
  } catch (error) {
    console.error('Error in history DELETE route:', error);
    return res.status(500).json({ error: 'Failed to delete city from search history' });
  }
});

export default router;