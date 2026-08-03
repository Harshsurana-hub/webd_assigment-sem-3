function getWeather() {
    const city = document.getElementById("city").value;
    const result = document.getElementById("result");

    if (city === "") {
        result.innerHTML = "Enter a city name";
        return;
    }

    const apiKey = "961b5dcd28eb8ab3f0aa3e578ac459ae";
 
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            

            result.innerHTML = `
                <b>${data.name}</b><br>
                Temp: ${data.main.temp}°C<br>
                Humidity: ${data.main.humidity}%<br>
                Weather: ${data.weather[0].description}
            `;
        });
}