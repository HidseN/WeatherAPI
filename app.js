const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.get("/weather/current", async function (req, res) {
  console.log(req.query.cityName);
  const query = req.query.cityName;
  const apiKey = process.env.API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&q=${query}&units=metric`;

  try {
    const response = await axios.get(url);
    const weatherData = response.data;

    const result = {
      cityName: query,
      weatherDescription: weatherData.weather[0].description,
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      icon: weatherData.weather[0].icon,
    };

    res.send(result);
  } catch (error) {
    console.error("Error retrieving weather data:", error.message);
    res.status(500).send("Error retrieving weather data");
  }
});

app.get("/weather/forecast", async function (req, res) {
  const query = req.query.cityName;
  const apiKey = process.env.API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${query}&units=metric&appid=${apiKey}`;

  try {
    const response = await axios.get(url);
    const weatherData = response.data;
    const weatherForecast = [];
    for (let i = 0; i < weatherData.list.length; i++) {
      const day = {
        cityName: query,
        date: weatherData.list[0].dt_txt,
        weatherDescription: weatherData.list[0].weather[0].description,
        temperature: weatherData.list[0].main.temp,
        humidity: weatherData.list[0].main.humidity,
      };

      weatherForecast.push(day);
    }

    res.send(weatherForecast);
  } catch (error) {
    console.error("Error retrieving weather data:", error.message);
    res.status(500).send("Error retrieving weather data");
  }
});

app.get("/weather/history", async function (req, res) {
  const query = req.query.cityName;
  const apiKey = process.env.API_KEY;
  const start = req.query.startDate;
  const end = req.query.endDate;

  // Unix timestamps
  const startDate = Math.round(new Date(start).getTime() / 1000);
  const endDate = Math.round(new Date(end).getTime() / 1000);

  const url = `https://history.openweathermap.org/data/2.5/history/city?q=${query}&type=hour&start=${startDate}&end=${endDate}&appid=${apiKey}`;
  const weatherResponse = await axios.get(url);
  const weatherData = weatherResponse.data;

  console.log(weatherData);

  const result = {
    cityName: query,
    weatherDescription: weatherData.current.weather[0].description,
    temperature: weatherData.current.temp,
    humidity: weatherData.current.humidity,
    icon: weatherData.current.weather[0].icon,
  };

  res.send(result);
});

app.listen(3000, function () {
  console.log("Server running on port 3000!");
});
