
import { WeatherData } from "../types";

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&hourly=temperature_2m&daily=weather_code,precipitation_sum&timezone=auto`
    );
    const data = await response.json();
    
    // Simplistic mapping of weather codes to strings
    const codeMap: Record<number, string> = {
      0: "Clear Sky",
      1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
      45: "Fog", 48: "Depositing Rime Fog",
      51: "Drizzle", 61: "Rain", 80: "Rain Showers",
      95: "Thunderstorm"
    };

    const currentCode = data.current.weather_code;
    const condition = codeMap[currentCode] || "Varying";

    return {
      temp: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      condition,
      forecast: `Expect ${condition.toLowerCase()} with high humidity today.`
    };
  } catch (error) {
    console.error("Weather fetch failed", error);
    return {
      temp: 25,
      humidity: 60,
      precipitation: 0,
      condition: "Unknown",
      forecast: "Unable to load weather. Stick to standard seasonal practices."
    };
  }
};
