// 🌐 API CONFIG
const API_KEY = "91cb278f19746ae9944a2ed63bf58ed3";


function WeatherApp(apiKey) {
  this.apiKey = apiKey;
  this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
  this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

  // 🎯 DOM
  this.searchBtn = document.getElementById("search-btn");
  this.cityInput = document.getElementById("city-input");
  this.weatherDisplay = document.getElementById("weather-display");

  this.recentSearchesSection = document.getElementById("recent-searches-section");
  this.recentSearchesContainer = document.getElementById("recent-searches-container");

  // 💾 STORAGE
  this.recentSearches = [];
  this.maxRecentSearches = 5;

  this.init();
}

//////////////////////////////////////////////////////
// 🚀 INIT (Part 2 + Part 4)
//////////////////////////////////////////////////////
WeatherApp.prototype.init = function () {
  this.searchBtn.addEventListener("click", this.handleSearch.bind(this));

  this.cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      this.handleSearch();
    }
  });

  this.loadRecentSearches(); // Part 4
  this.loadLastCity();       // Part 4
};

//////////////////////////////////////////////////////
// 🔍 HANDLE SEARCH (Part 2)
//////////////////////////////////////////////////////
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

//////////////////////////////////////////////////////
// 🌦️ GET WEATHER (Part 1 + Part 2 + Part 3 + Part 4)
//////////////////////////////////////////////////////
WeatherApp.prototype.getWeather = async function (city) {
  this.showLoading();
  this.searchBtn.disabled = true;
  this.searchBtn.textContent = "Searching...";

  const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

  try {
    const [currentWeather, forecastData] = await Promise.all([
      axios.get(currentUrl),       // Part 1
      this.getForecast(city),      // Part 3
    ]);

    this.displayWeather(currentWeather.data);
    this.displayForecast(forecastData);

    // 💾 Part 4
    this.saveRecentSearch(city);
    localStorage.setItem("lastCity", city);

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

//////////////////////////////////////////////////////
// 📊 GET FORECAST (Part 3)
//////////////////////////////////////////////////////
WeatherApp.prototype.getForecast = async function (city) {
  const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
  const response = await axios.get(url);
  return response.data;
};

//////////////////////////////////////////////////////
// 📊 PROCESS FORECAST (Part 3)
//////////////////////////////////////////////////////
WeatherApp.prototype.processForecastData = function (data) {
  return data.list
    .filter((item) => item.dt_txt.includes("12:00:00"))
    .slice(0, 5);
};

//////////////////////////////////////////////////////
// 🌡️ DISPLAY CURRENT WEATHER (Part 1)
//////////////////////////////////////////////////////
WeatherApp.prototype.displayWeather = function (data) {
  this.weatherDisplay.innerHTML = `
    <div class="weather-card">
      <h2>${data.name}</h2>
      <p>🌡️ Temp: ${Math.round(data.main.temp)} °C</p>
      <p>🌥️ Weather: ${data.weather[0].description}</p>
      <p>💨 Wind: ${data.wind.speed} m/s</p>
    </div>
  `;
};

//////////////////////////////////////////////////////
// 📅 DISPLAY FORECAST (Part 3)
//////////////////////////////////////////////////////
WeatherApp.prototype.displayForecast = function (data) {
  const days = this.processForecastData(data);

  const forecastHTML = days.map((day) => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", {
      weekday: "short",
    });

    return `
      <div class="forecast-card">
        <h4>${dayName}</h4>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
        <p>${Math.round(day.main.temp)}°C</p>
        <p>${day.weather[0].description}</p>
      </div>
    `;
  }).join("");

  this.weatherDisplay.innerHTML += `
    <div class="forecast-section">
      <h3>5-Day Forecast</h3>
      <div class="forecast-container">
        ${forecastHTML}
      </div>
    </div>
  `;
};

//////////////////////////////////////////////////////
// 💾 LOAD RECENT (Part 4)
//////////////////////////////////////////////////////
WeatherApp.prototype.loadRecentSearches = function () {
  const saved = localStorage.getItem("recentSearches");

  if (saved) {
    this.recentSearches = JSON.parse(saved);
  }

  this.displayRecentSearches();
};

//////////////////////////////////////////////////////
// 💾 SAVE RECENT (Part 4)
//////////////////////////////////////////////////////
WeatherApp.prototype.saveRecentSearch = function (city) {
  const cityName =
    city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

  const index = this.recentSearches.indexOf(cityName);

  if (index > -1) {
    this.recentSearches.splice(index, 1);
  }

  this.recentSearches.unshift(cityName);

  if (this.recentSearches.length > this.maxRecentSearches) {
    this.recentSearches.pop();
  }

  localStorage.setItem(
    "recentSearches",
    JSON.stringify(this.recentSearches)
  );

  this.displayRecentSearches();
};

//////////////////////////////////////////////////////
// 📊 DISPLAY RECENT (Part 4)
//////////////////////////////////////////////////////
WeatherApp.prototype.displayRecentSearches = function () {
  this.recentSearchesContainer.innerHTML = "";

  if (this.recentSearches.length === 0) {
    this.recentSearchesSection.style.display = "none";
    return;
  }

  this.recentSearchesSection.style.display = "block";

  this.recentSearches.forEach((city) => {
    const btn = document.createElement("button");
    btn.className = "recent-search-btn";
    btn.textContent = city;

    btn.addEventListener("click", () => {
      this.cityInput.value = city;
      this.getWeather(city);
    });

    this.recentSearchesContainer.appendChild(btn);
  });
};

//////////////////////////////////////////////////////
// 🔄 LOAD LAST CITY (Part 4)
//////////////////////////////////////////////////////
WeatherApp.prototype.loadLastCity = function () {
  const lastCity = localStorage.getItem("lastCity");

  if (lastCity) {
    this.getWeather(lastCity);
  } else {
    this.showWelcome();
  }
};

//////////////////////////////////////////////////////
// 🌍 WELCOME
//////////////////////////////////////////////////////
WeatherApp.prototype.showWelcome = function () {
  this.weatherDisplay.innerHTML = `
    <div class="welcome-message">
      <h2>🌤️ SkyFetch</h2>
      <p>Search a city to get weather details</p>
    </div>
  `;
};

//////////////////////////////////////////////////////
// ⏳ LOADING
//////////////////////////////////////////////////////
WeatherApp.prototype.showLoading = function () {
  this.weatherDisplay.innerHTML = `
    <div class="loading-container">
      <p>Loading...</p>
    </div>
  `;
};

//////////////////////////////////////////////////////
// ❌ ERROR
//////////////////////////////////////////////////////
WeatherApp.prototype.showError = function (msg) {
  this.weatherDisplay.innerHTML = `
    <p style="color:red;">❌ ${msg}</p>
  `;
};

//////////////////////////////////////////////////////
// 🚀 START APP
//////////////////////////////////////////////////////
const app = new WeatherApp(API_KEY);