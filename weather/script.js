function fetchWeatherData() {
    const cityInputField = document.getElementById("city").value;
    const weatherResultDisplay = document.getElementById("result");

    if (cityInputField === "") {
        weatherResultDisplay.innerHTML = "Enter a city name";
        return;
    }

    const openWeatherApiKey = "YOUR_OPENWEATHER_API_KEY";

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityInputField}&appid=${openWeatherApiKey}&units=metric`)
        .then(response => response.json())
        .then(weatherData => {
            weatherResultDisplay.innerHTML = `
                <b>${weatherData.name}</b><br>
                Temp: ${weatherData.main.temp}°C<br>
                Humidity: ${weatherData.main.humidity}%<br>
                Weather: ${weatherData.weather[0].description}
            `;
        });
}