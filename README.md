# Weather Dashboard

A full-stack web application that allows users to search for weather forecasts by city name. The app displays current weather conditions and a 5-day forecast, with search history functionality.

## Deployed Application

**Live Site:** [Weather Dashboard](https://weather-dashboard-vvlg.onrender.com/)

![Weather Dashboard Screenshot](![Screenshot (11)](https://github.com/user-attachments/assets/43d70cc3-da91-42c3-9b80-1eebacb01efb)
 )


## Features

- **City Search:** Search for any city worldwide
- **Current Weather:** View current temperature, wind speed, and humidity
- **5-Day Forecast:** See a 5-day weather forecast
- **Search History:** Previously searched cities are saved and can be quickly accessed
- **Responsive Design:** Works on desktop and mobile devices

## Technologies Used

### Frontend
- HTML5
- CSS3
- TypeScript
- Vite
- Day.js for date formatting

### Backend
- Node.js
- Express.js
- TypeScript
- OpenWeatherMap API

### Development & Deployment
- Git/GitHub
- Render (Deployment)
- npm for package management

## Installation

To run this application locally:

1. Clone the repository
   ```
   git clone https://github.com/montygracey/weather-dashboard.git
   cd weather-dashboard
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the server directory
   ```
   API_BASE_URL=https://api.openweathermap.org
   API_KEY=your_openweathermap_api_key
   ```

4. Start the development server
   ```
   npm run start:dev
   ```

5. Open `http://localhost:3000` in your browser

## Usage

1. Enter a city name in the search box
2. Click the "Search" button to display weather data
3. View current weather and 5-day forecast
4. Previously searched cities appear in the history sidebar
5. Click on a city in the history to search for it again
6. Use the delete button (trash icon) to remove cities from history

## API Reference

This application uses the [OpenWeatherMap API](https://openweathermap.org/api) for weather data:

- Geocoding API to convert city names to coordinates
- 5-day weather forecast API to retrieve weather data

## Project Structure

```
└── weather-dashboard/
    ├── package.json
    ├── tsconfig.json
    ├── client/
    │   ├── index.html
    │   ├── src/
    │   │   ├── main.ts
    │   │   └── styles/
    │   │       └── jass.css
    └── server/
        ├── db/
        │   └── db.json
        └── src/
            ├── server.ts
            ├── routes/
            │   ├── htmlRoutes.ts
            │   └── api/
            │       ├── index.ts
            │       └── weatherRoutes.ts
            └── service/
                ├── historyService.ts
                └── weatherService.ts
```

