(function init() {
    document.getElementById("entry").placeholder = "Search for a city";
    document.getElementById("search").addEventListener("click", search, false);
    function layoutCurrentWeather() {
        html = `            
        <div id="weather" class="mode">
            <h1 id="city">-?-</h1>
            <h2 id="temp">-°C</h2>
            <div id="icon">
                <img src="icons/unknown.png" alt="Weather icon" />
            </div>
            <p id="description">?</p>
            <p id="temps">-°C / -°C</p>
        </div>`;
        document.getElementById("current-weather").innerHTML = html;
    }

    function layoutHourlyWeather() {
        html = "";
        for (var i = 0; i < 24; i++) {
            html += `
            <div class="hourly-weather-list" class="mode">
                <div id="hourly-icon-${i}">
                    <img width=100px height=100px src="icons/unknown.png" alt="Weather icon"/>
                </div>
                    <p id="hourly-temp-${i}">-°C</p>
                    <p id="hourly-date-${i}">-/-/-</p>
                </div>
            </div>`;
        }
        document.getElementById("hourly-weather").innerHTML = html;
    }

    function layoutDailyWeather() {
        html = "";
        for (var i = 0; i < 8; i++) {
            html += `
        <div class="daily-weather-list mode">
            <p id="daily-date-${i}">-/-/-</p>
            <p id="daily-temps-${i}">-°C / -°C</p>
            <div id="daily-icon-${i}">
                <img src="icons/unknown.png" alt="Weather icon" />
            </div>
        </div>`;
        }
        document.getElementById("daily-weather").innerHTML = html;
    }
    layoutCurrentWeather();
    layoutHourlyWeather();
    layoutDailyWeather();
})();

if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(setPosition, showError, {
        enableHighAccuracy: true,
    });
} else {
    showError("Browser doesn't Support Geolocation");
}

app = {};
app.key = "2e908b1e1d7bd12a92475086f0728778";
app.lang = window.navigator.language || navigator.browserLanguage;
app.conf = `&appid=${app.key}&units=metric&lang=${app.lang}`;

function setPosition(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}${app.conf}`;
    app.fetchData(url);
    let urlAll = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely${app.conf}`;
    app.fetchWeather(urlAll);
}

function showError(error) {
    document.getElementById("notification").style.display = "block";
    document.getElementById(
        "notification"
    ).innerHTML = `<p> ${error.message} </p>`;
}

app.fetchData = async function (url) {
    fetch(url)
        .then((response) => response.json())
        .then((data) => (app.weather = data))
        .then(app.processData)
        .then(app.showData)
        .then(app.showBG)
        .catch((error) => showError(error));
};

app.fetchWeather = async function (url) {
    fetch(url)
        .then((response) => response.json())
        .then((data) => (app.predictions = data))
        .then(app.saveHourly)
        .then(app.saveDaily)
        .then(app.showHourly)
        .then(app.showDaily)
        .catch((error) => showError(error));
};

app.formating = function (unix_timestamp) {
    var date = new Date(unix_timestamp * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var formattedTime = hours + ":" + minutes.substr(-2);
    return formattedTime;
};

app.showBG = function () {
    document.getElementById(
        "bg"
    ).style.background = `url(bg/${app.currentWeather.icon}.jpg)`;
    document.getElementById("bg").style.backgroundRepeat = `no-repeat`;
    document.getElementById("bg").style.backgroundSize = `cover`;
};

app.processData = function () {
    if (app.weather.coord) {
        app.currentWeather = {
            city: app.weather.name,
            temp: app.weather.main.temp.toFixed(0) + "°C",
            icon: app.weather.weather[0].icon,
            description: app.weather.weather[0].description.toUpperCase(),
            tempMax: app.weather.main.temp_max.toFixed(0) + "°C",
            tempMin: app.weather.main.temp_min.toFixed(0) + "°C",
        };
        let lat = app.weather.coord.lat;
        let lon = app.weather.coord.lon;
        let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely${app.conf}`;
        app.fetchWeather(url);
    }
};

app.showData = function () {
    if (app.currentWeather.city) {
        let city = document.getElementById("city");
        let temp = document.getElementById("temp");
        let icon = document.getElementById("icon");
        let description = document.getElementById("description");
        let temps = document.getElementById("temps");
        city.textContent = app.currentWeather.city;
        temp.textContent = app.currentWeather.temp;
        icon.innerHTML = `<img src="icons/${app.currentWeather.icon}.png" alt="Weather icon"/>`;
        description.textContent = app.currentWeather.description;
        temps.innerHTML = `<span class="min">${app.currentWeather.tempMin}</span> / <span class="max">${app.currentWeather.tempMax}</span>`;
    }
};

app.saveHourly = function () {
    if (app.predictions.hourly) {
        app.hourly = [];
        app.predictions.hourly.slice(0, 24).forEach((hour) => {
            app.hourly.push({
                icon: hour.weather[0].icon,
                temp: hour.temp.toFixed(0) + "°C",
                date: app.formating(hour.dt),
            });
        });
    }
};

app.showHourly = function () {
    if (app.hourly) {
        let count = 0;
        html = "";
        app.hourly.forEach((hour) => {
            let icon = document.getElementById(`hourly-icon-${count}`);
            let temp = document.getElementById(`hourly-temp-${count}`);
            let date = document.getElementById(`hourly-date-${count}`);
            icon.innerHTML = `<img width="100px" height="100px" src="icons/${hour.icon}.png" alt="Weather icon" />`;
            temp.textContent = hour.temp;
            date.textContent = hour.date;
            count++;
        });
        let dir = true;
        document.getElementById("hourly-weather").scrollLeft = 0;
        app.slider = setInterval(() => {
            let width =
                document.getElementById("hourly-weather").scrollWidth -
                document.getElementById("hourly-weather").clientWidth;
            let scroll = document.getElementById("hourly-weather");
            let move = 1;
            if (dir == true) {
                scroll.scrollLeft += move;
                if (scroll.scrollLeft >= width) {
                    dir = false;
                }
            }
            if (dir == false) {
                scroll.scrollLeft -= move;
                if (scroll.scrollLeft <= 0) {
                    dir = true;
                }
            }
        }, 20);
    }
};

app.saveDaily = function () {
    if (app.predictions.daily) {
        app.daily = [];
        let date = new Date();
        app.predictions.daily.forEach((day) => {
            app.daily.push({
                date: date
                    .toLocaleDateString(app.lang, {
                        weekday: "long",
                    })
                    .toUpperCase(),
                icon: day.weather[0].icon,
                tempMin: day.temp.min.toFixed(0) + "°C",
                tempMax: day.temp.max.toFixed(0) + "°C",
            });
            date.setDate(date.getDate() + 1);
        });
    }
};

app.showDaily = function () {
    if (app.daily) {
        let count = 0;
        app.daily.forEach((day) => {
            let date = document.getElementById(`daily-date-${count}`);
            let icon = document.getElementById(`daily-icon-${count}`);
            let temp = document.getElementById(`daily-temps-${count}`);
            date.textContent = day.date;
            icon.innerHTML = `<img width=50px height=50px src="icons/${day.icon}.png" alt="Weather icon"/>`;
            temp.innerHTML = `<span class="min">${day.tempMin}</span> / <span class="max">${day.tempMax}</span>`;
            count++;
        });
    }
};

async function search(e) {
    e.preventDefault();
    let city = document.getElementById("entry").value;
    if (city) {
        clearInterval(app.slider);
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}${app.conf}`;
        app.fetchData(url);
    }
}
