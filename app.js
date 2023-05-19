const express = require("express");
const axios = require("axios");
require("dotenv").config();
// Added users from local JSON file to keep it simple, rather than implementing MongoDB
const users = require("./users.json");
// Caching
const NodeCache = require("node-cache");
const myCache = new NodeCache({ checkperiod: 600 });
// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let auth = false;

app.get("/weather/auth", function (req, res) {
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
    console.log("You have successfully authenticated!");
    res.send("You have successfully authenticated!");
  } else {
    res.send("Please enter an existing user info! ");
  }
});

app.get("/weather/current", async function (req, res) {
  if (!auth) {
    console.log("Not logged in");
    res.send(
      "##You are not authenticated!## Log in to get access to information!"
    );
  } else {
    const query = capitalize(req.query.cityName);
    console.log(query);
    const apiKey = process.env.API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&q=${query}&units=metric`;

    try {
      let cachedData = myCache.get("currentWeather");

      if (cachedData !== undefined && cachedData.name === query) {
        const weatherData = cachedData;
        const result = {
          cityName: query,
          weatherDescription: weatherData.weather[0].description,
          temperature: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          icon: weatherData.weather[0].icon,
        };

        console.log("Cached data displayed.");
        res.send(result);
      } else {
        const response = await axios.get(url);
        const weatherData = response.data;

        cachedData = myCache.set("currentWeather", weatherData, 600);
        cachedData = myCache.get("currentWeather");
        console.log(cachedData.name);

        const result = {
          cityName: query,
          weatherDescription: weatherData.weather[0].description,
          temperature: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          icon: weatherData.weather[0].icon,
        };

        console.log("Data retrieved from API call.");
        res.send(result);
      }
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
      "##You are not authenticated!## Log in to get access to information!"
    );
  } else {
    const query = capitalize(req.query.cityName);
    console.log(query);
    const apiKey = process.env.API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${query}&units=metric&appid=${apiKey}`;

    try {
      let cachedData = myCache.get("weatherForecast");

      if (cachedData !== undefined && cachedData.city.name === query) {
        const weatherData = cachedData;
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
        console.log("Cached data displayed");
        res.send(weatherForecast);
      } else {
        const response = await axios.get(url);
        const weatherData = response.data;

        cachedData = myCache.set("weatherForecast", weatherData, 600);
        cachedData = myCache.get("weatherForecast");
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
        console.log("Data retrieved from API call.");
        res.send(weatherForecast);
      }
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

let cityId = 0;

app.get("/weather/history", async function (req, res) {
  if (!auth) {
    console.log("Not logged in");
    res.send(
      "##You are not authenticated!## Log in to get access to information!"
    );
  } else {
    const query = capitalize(req.query.cityNameAndCountryCode);
    console.log(query);
    const apiKey = process.env.API_KEY;
    const start = req.query.startDate;
    const end = req.query.endDate;

    // Unix timestamps
    const startDate = Math.round(new Date(start).getTime() / 1000);
    const endDate = Math.round(new Date(end).getTime() / 1000);

    try {
      let cachedData = myCache.get("weatherHistory");

      if (cachedData && cachedData.cityName === query) {
        const weatherData = cachedData;

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
        console.log("Cached data displayed.");
        res.send(days);
      } else {
        const url = `https://history.openweathermap.org/data/2.5/history/city?q=${query}&type=hour&units=metric&start=${startDate}&end=${endDate}&appid=${apiKey}`;
        const response = await axios.get(url);
        const weatherData = response.data;
        weatherData.cityName = query;

        cachedData = myCache.set("weatherHistory", weatherData, 600); //  600 seconds === 10 minutes, cached data will be deleted after this time
        cachedData = myCache.get("weatherHistory");
        cityId = cachedData.city_id;
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
        console.log("Data retrieved from API call");
        res.send(days);
      }
    } catch (error) {
      cityId = null;
      if (error.response.status === 404) {
        res.status(404).send("Please enter a valid city");
      } else {
        console.error("Error retrieving weather data:", error.message);
        res.status(500).send("Error retrieving weather data");
      }
    }
  }
});

function capitalize(str) {
  if (str.length === 0) {
    return "";
  }

  const firstLetter = str[0].toUpperCase();
  const remainingLetters = str.slice(1).toLowerCase();

  return firstLetter + remainingLetters;
}

app.listen(3000, function () {
  console.log("Server running on port 3000!");
});
