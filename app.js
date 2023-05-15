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
    if (error.response.status === 404) {
      res.status(404).send("Please enter a valid city");
    } else {
      console.error("Error retrieving weather data:", error.message);
      res.status(500).send("Error retrieving weather data");
    }
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
    for (let i = 0; i < weatherData.list.length; i += 8) {
      const day = {
        cityName: query,
        date: weatherData.list[i].dt_txt,
        weatherDescription: weatherData.list[i].weather[0].description,
        temperature: weatherData.list[i].main.temp,
        humidity: weatherData.list[i].main.humidity,
      };
      weatherForecast.push(day);
    }

    res.send(weatherForecast);
  } catch (error) {
    if (error.response.status === 404) {
      res.status(404).send("Please enter a valid city");
    } else {
      console.error("Error retrieving weather data:", error.message);
      res.status(500).send("Error retrieving weather data");
    }
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

  try {
    const url = `https://history.openweathermap.org/data/2.5/history/city?q=${query}&type=hour&units=metric&start=${startDate}&end=${endDate}&appid=${apiKey}`;
    const weatherResponse = await axios.get(url);
    const weatherData = weatherResponse.data;

    const days = [];

    for (let i = 0; i < weatherData.list.length; i += 24) {
      const date = new Date(weatherData.list[i].dt * 1000);

      const result = {
        cityName: query,
        weatherDescription: weatherData.list[i].weather[0].description,
        temperature: weatherData.list[i].main.temp,
        humidity: weatherData.list[i].main.humidity,
        date: date.toLocaleString(),
      };

      console.log(result);

      days.push(result);
    }

    res.send(days);
  } catch (error) {
    if (error.response.status === 404) {
      res.status(404).send("Please enter a valid city");
    } else {
      console.error("Error retrieving weather data:", error.message);
      res.status(500).send("Error retrieving weather data");
    }
  }
});

app.listen(3000, function () {
  console.log("Server running on port 3000!");
});
