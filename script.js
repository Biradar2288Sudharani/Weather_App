// API Configuration
const apiKey = 'f37251623b8824a52046a7cc40fbafe6'; // Replace with your OpenWeatherMap API key
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const weatherDisplay = document.getElementById('weather-display');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('error-message');

// Weather Display Elements
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const weatherIcon = document.getElementById('weather-icon');
const weatherDescription = document.getElementById('weather-description');
const currentTemp = document.getElementById('current-temp');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');

// Initialize the app
function init() {
    setCurrentDate();
    addEventListeners();
    
    // Check if there's a previously searched city in localStorage
    const lastCity = localStorage.getItem('lastSearchedCity');
    if (lastCity) {
        cityInput.value = lastCity;
        getWeatherByCity(lastCity);
    }
}

// Set current date
function setCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
}

// Add event listeners
function addEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    currentLocationBtn.addEventListener('click', getWeatherByCurrentLocation);
}

// Handle search
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    } else {
        showError('Please enter a city name');
    }
}

// Get weather by city name
async function getWeatherByCity(city) {
    showLoading();
    hideError();
    hideWeatherDisplay();
    
    try {
        const response = await fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=metric`);
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        displayWeather(data);
        
        // Save to localStorage
        localStorage.setItem('lastSearchedCity', city);
        
    } catch (err) {
        showError(err.message);
    }
}

// Get weather by current location
function getWeatherByCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading();
    hideError();
    hideWeatherDisplay();
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const response = await fetch(
                    `${apiUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
                );
                
                if (!response.ok) {
                    throw new Error('Location not found');
                }
                
                const data = await response.json();
                displayWeather(data);
                cityInput.value = data.name;
                
                // Save to localStorage
                localStorage.setItem('lastSearchedCity', data.name);
                
            } catch (err) {
                showError(err.message);
            }
        },
        (error) => {
            showError('Unable to retrieve your location');
        }
    );
}

// Display weather data
function displayWeather(data) {
    hideLoading();
    showWeatherDisplay();
    
    // Update DOM elements
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    weatherDescription.textContent = data.weather[0].description;
    currentTemp.textContent = Math.round(data.main.temp);
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
}

// UI State Management
function showLoading() {
    loading.style.display = 'block';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showWeatherDisplay() {
    weatherDisplay.style.display = 'block';
}

function hideWeatherDisplay() {
    weatherDisplay.style.display = 'none';
}

function showError(message) {
    hideLoading();
    hideWeatherDisplay();
    errorMessage.textContent = message;
    error.style.display = 'block';
}

function hideError() {
    error.style.display = 'none';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}