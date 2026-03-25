// 🌦️ WeatherApp Constructor
function WeatherApp(apiKey) {
  this.apiKey = apiKey;
  this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
  this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

  // DOM Elements
  this.searchBtn = document.getElementById("search-btn");
  this.cityInput = document.getElementById("city-input");
  this.weatherDisplay = document.getElementById("weather-display");

  // Init
  this.init();
}

// 🚀 INIT
WeatherApp.prototype.init = function () {
  this.searchBtn.addEventListener("click", this.handleSearch.bind(this));

  this.cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      this.handleSearch();
    }
  });

  this.showWelcome();
};

// 🌍 Welcome UI
WeatherApp.prototype.showWelcome = function () {
  this.weatherDisplay.innerHTML = `
    <div class="welcome-message">
      <h2>🌤️ Welcome to SkyFetch</h2>
      <p>Enter a city name to get weather details</p>
    </div>
  `;
};

// 🔍 Handle Search
WeatherApp.prototype.handleSearch = function () {
  const city = this.cityInput.value.trim();

  if (!city) {
    this.showError("Please enter a city name");
    return;
  }

  if (city.length < 2) {
    this.showError("City name too short");
    return;
  }

  this.getWeather(city);
  this.cityInput.value = "";
};

// 🌦️ Get Weather + Forecast
WeatherApp.prototype.getWeather = async function (city) {
  this.showLoading();
  this.searchBtn.disabled = true;
  this.searchBtn.textContent = "Searching...";

  const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

  try {
    const [currentWeather, forecastData] = await Promise.all([
      axios.get(currentUrl),
      this.getForecast(city),
    ]);

    this.displayWeather(currentWeather.data);
    this.displayForecast(forecastData);

  } catch (error) {
    console.error(error);

    if (error.response && error.response.status === 404) {
      this.showError("City not found");
    } else {
      this.showError("Something went wrong");
    }

  } finally {
    this.searchBtn.disabled = false;
    this.searchBtn.textContent = "Search";
  }
};

// 📊 Get Forecast API
WeatherApp.prototype.getForecast = async function (city) {
  const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

  const response = await axios.get(url);
  return response.data;
};

// 📊 Process Forecast (5 days)
WeatherApp.prototype.processForecastData = function (data) {
  const filtered = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );

  return filtered.slice(0, 5);
};

// 🌡️ Display Current Weather
WeatherApp.prototype.displayWeather = function (data) {
  const html = `
    <div class="weather-card">
      <h2>${data.name}</h2>
      <p>🌡️ Temp: ${Math.round(data.main.temp)} °C</p>
      <p>🌥️ Weather: ${data.weather[0].description}</p>
      <p>💨 Wind: ${data.wind.speed} m/s</p>
    </div>
  `;

  this.weatherDisplay.innerHTML = html;
};

// 📅 Display Forecast
WeatherApp.prototype.displayForecast = function (data) {
  const days = this.processForecastData(data);

  const forecastHTML = days.map((day) => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    return `
      <div class="forecast-card">
        <h4>${dayName}</h4>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
        <p>${Math.round(day.main.temp)}°C</p>
        <p>${day.weather[0].description}</p>
      </div>
    `;
  }).join("");

  const section = `
    <div class="forecast-section">
      <h3>5-Day Forecast</h3>
      <div class="forecast-container">
        ${forecastHTML}
      </div>
    </div>
  `;

  this.weatherDisplay.innerHTML += section;
};

// ⏳ Loading UI
WeatherApp.prototype.showLoading = function () {
  this.weatherDisplay.innerHTML = `<p>Loading...</p>`;
};

// ❌ Error UI
WeatherApp.prototype.showError = function (msg) {
  this.weatherDisplay.innerHTML = `<p style="color:red;">❌ ${msg}</p>`;
};

// 🚀 Start App
const app = new WeatherApp("91cb278f19746ae9944a2ed63bf58ed3");