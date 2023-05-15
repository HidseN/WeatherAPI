const express = require("express");
const axios = require("axios");
require("dotenv").config();
// Added users from local JSON file to keep it simple, rather than implementing mongoDB
const users = require("./users.json");

const app = express();

let auth = false;

app.get("/auth", function (req, res) {
  const email = req.query.email;
  const password = req.query.password;

  const user = {
    email,
    password,
  };

  const contains = users.some((element) => {
    return JSON.stringify(user) === JSON.stringify(element);
  });

  if (contains) {
    auth = true;
    console.log("Logged in");
    res.send("Logged in");
  } else {
    res.send("Please enter an existing user info! ");
  }
});

app.get("/weather/current", async function (req, res) {
  if (!auth) {
    console.log("Not logged in");
    res.send(
      "You are not authenticated! Please log in to access this information!"
    );
  } else {
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
  }
});

app.get("/weather/forecast", async function (req, res) {
  if (!auth) {
    console.log("Not logged in");
    res.send(
      "You are not authenticated! Please log in to access this information!"
    );
  } else {
    const query = req.query.cityName;
    console.log(query);
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
  }
});

app.get("/weather/history", async function (req, res) {
  if (!auth) {
    console.log("Not logged in");
    res.send(
      "You are not authenticated! Please log in to access this information!"
    );
  } else {
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
  }
});

app.listen(3000, function () {
  console.log("Server running on port 3000!");
});
