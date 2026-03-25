// 🌐 API details
const API_KEY = "YOUR_REAL_API_KEY"; // 🔁 Replace this
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

// 🎯 Elements
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherDisplay = document.getElementById("weather-display");

// 🔍 Button Click Event
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name");
    return;
  }

  if (city.length < 2) {
    showError("City name too short");
    return;
  }

  getWeather(city);
  cityInput.value = "";
});

// ⌨️ Enter Key Support
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// 🌦️ Fetch Weather (Async/Await)
async function getWeather(city) {
  showLoading();

  const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const response = await axios.get(url);
    displayWeather(response.data);

  } catch (error) {
    console.error("Error:", error);

    if (error.response && error.response.status === 404) {
      showError("City not found. Try again.");
    } else {
      showError("Something went wrong.");
    }
  }
}

// 📊 Display Weather
function displayWeather(data) {
  const html = `
    <div class="weather-card">
      <h2>${data.name}</h2>
      <p>🌡️ Temp: ${Math.round(data.main.temp)} °C</p>
      <p>🌥️ Weather: ${data.weather[0].description}</p>
      <p>💨 Wind: ${data.wind.speed} m/s</p>
    </div>
  `;

  weatherDisplay.innerHTML = html;

  // Focus back to input
  cityInput.focus();
}

// ⏳ Loading UI
function showLoading() {
  weatherDisplay.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  `;
}

// ❌ Error UI
function showError(message) {
  weatherDisplay.innerHTML = `
    <div class="error-message">
      ❌ ${message}
    </div>
  `;
}

// 🌍 Initial Message
weatherDisplay.innerHTML = `
  <p>🌍 Enter a city name to get weather</p>
`;