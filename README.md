# WeatherAPI

This project is a RESTful API developed using Node.js. 
The API allows users to retrieve current weather conditions for a specific location, weather forecast, as well as historical weather data for a given time range. 
It includes error handling for cases such as invalid location inputs and server errors.

## Preconditions for an API call

Server must be running.  
User must be authenticated.  
Valid API Key.

## Current weather

/weather/current: Retrieves the current weather conditions for a specific location.

## Weather forecast

/weather/forecast: Retrieves the weather forecast for a specific location.

## Historical weather data

/weather/history: Retrieves historical weather data for a specific location.

## Authorization

Dummy data was used for authorization because it is simplier.

## Successful scenario 

In a successful scenario, user has logged in and has entered valid data. The user makes an API call to retrieve weather information from the Weather App API.
The API processes the request successfully and returns the desired weather data to the user.
The API formats the retrieved weather data into a JSON response object, including details such as temperature, humidity, and weather description.
The API sets the appropriate HTTP status code, such as 200 OK, indicating a successful request.
The user can then utilize the weather data in their application or display it to the end-users.

## Example of successful API call

API Endpoint: /weather/current

Request Method: GET

Request Parameters:

Location: "Berlin"

Response:

json  
{  
  "location": "Berlin",  
  "temperature": 23.5,  
  "humidity": 65,  
  "description": "Partly cloudy"  
}


## Handling API Errors

To provide a good user experience, it's important to handle errors that may occur when using the API.
When users provide invalid inputs, such as an incorrect location or missing parameters, 
the API responsd with a suitable error message. 
For example, returning a 400 Bad Request status code along with a JSON response that includes an error message explaining the issue.


## Logging 

Logging is implemented to aid in debugging and troubleshooting issues with the API. 
Information about each request and response is logged (console.log) to easily track down errors and identify the source of the problem.

## Swagger

Swagger is used to create interactive API documentation. 
Swagger Editor is used to validate and format the specification, and Swagger UI generates documentation with an interactive interface for exploring the API endpoints.

## Caching for Performance 
Caching is implemented to improve API performance. Weather data, which doesn't change frequently, 
is cached for a certain amount of time (e.g., 5-10 minutes) to avoid unnecessary requests to the weather API provider.















