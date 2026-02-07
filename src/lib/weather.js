const OPEN_WEATHER_API_KEY = import.meta.env.OPEN_WEATHER_API_KEY;

export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => reject(error),
    );
  });
};

export const fetchWeather = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`;
  const response = await fetch(url)

  if (!response.ok) { 
    throw new Error("Failed to fetch weather data")
  }

  return await response.json();
}

export const normalizeWeather = (weatherData) => {
  const temperature = weatherData.main.temp;
  const condition = weatherData.weather[0].main.toLowerCase();
  const humidity = weatherData.main.humidity;

  let tempCategory = "mild";
  if (temperature >= 30) tempCategory = "hot";
  else if (temperature <= 15) tempCategory = "cold";

  let consditionCategory = "clear"
  if (condition.includes("rain")) consditionCategory = "rainy";
  if (condition.includes("cloud")) consditionCategory = "cloudy";
  if (condition.includes("snow")) consditionCategory = "snowy";

  let humidityCategory = "normal";
  if (humidity >= 70) humidityCategory = "humid"
  
  return {
    temperature,
    humidity,
    condition,

    tempCategory,
    consditionCategory,
    humidityCategory
  };
};

export const getSimplifiedWeather = async () => {
  try {
    const location = await getUserLocation();
    const rawWeather = await fetchWeather(location.lat, location.lon)
    return normalizeWeather(rawWeather);
  } catch (error) {
    console.log("Weather Error: ", error)
    return null;
  }
}


