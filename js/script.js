(function init() {
    document.getElementById("entry").placeholder = "Search for a city";
    document.getElementById("search").addEventListener("click", search, false);
})();

app = {};
app.key = "2e908b1e1d7bd12a92475086f0728778";
app.lang = window.navigator.language || navigator.browserLanguage;
app.url = `https://api.openweathermap.org/data/2.5/weather?q=Santo Domingo&appid=${app.key}&units=metric&lang=${app.lang}`;

app.fetchData = async function () {
    fetch(app.url)
        .then((response) => response.json())
        .then((data) => (app.weather = data))
        .then(app.processData)
        .then(app.showData)
        .then(fetchWeather)
        .catch((error) => console.log(error));
};

async function fetchWeather() {
    fetch(app.urlAll)
        .then((response) => response.json())
        .then((data) => (app.predictions = data))
        .then(app.saveHourly)
        .then(app.showHourly)
        .then(app.saveDaily)
        .then(app.showDaily)
        .catch((error) => console.log(error));
}

app.formating = function (unix_timestamp) {
    var date = new Date(unix_timestamp * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var formattedTime = hours + ":" + minutes.substr(-2);
    return formattedTime;
};

app.processData = function () {
    if (app.weather.name) {
        app.currentWeather = {
            city: app.weather.name,
            temp: app.weather.main.temp.toFixed(0) + "°C",
            icon: app.weather.weather[0].icon,
            description: app.weather.weather[0].description.toUpperCase(),
            tempMax: app.weather.main.temp_max.toFixed(0) + "°C",
            tempMin: app.weather.main.temp_min.toFixed(0) + "°C",
        };
        app.lat = app.weather.coord.lat;
        app.lon = app.weather.coord.lon;
        app.urlAll = `https://api.openweathermap.org/data/2.5/onecall?lat=${app.lat}&lon=${app.lon}&exclude=current,minutely&appid=${app.key}&units=metric&lang=${app.lang}`;
    }
};

app.showData = function () {
    if (app.currentWeather.city) {
        html = `            
        <div id="weather">
            <h1>${app.currentWeather.city}</h1>
            <p id="temp">${app.currentWeather.temp}</p>
                <img src="icons/${
                    app.currentWeather.icon
                }.png" alt="Weather icon" />
            <p>${app.currentWeather.description}</p>
            <p id="temps">${
                app.currentWeather.tempMin + " / " + app.currentWeather.tempMax
            }</p>
        </div>`;
        document.getElementById(
            "bg"
        ).style.background = `url(../bg/${app.currentWeather.icon}.jpg)`;
        document.getElementById("bg").style.backgroundRepeat = `no-repeat`;
        document.getElementById("bg").style.backgroundSize = `cover`;
        //.;
        document.getElementById("current-weather").innerHTML = html;
    }
};

app.saveDaily = function () {
    if (app.predictions.daily) {
        app.daily = [];
        let date = new Date();
        const options = {
            weekday: "long",
            //year: "numeric",
            //month: "long",
            //day: "numeric",
        };
        app.predictions.daily.forEach((day) => {
            app.daily.push({
                date: date.toLocaleDateString(app.lang, options).toUpperCase(),
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
        html = "";
        app.daily.forEach((day) => {
            html += `
            <div class="daily-weather-list">
                <p>${day.date}</p>
                <p>${day.tempMin + " / " + day.tempMax}C</p>
                <img width=50px height=50px src="icons/${
                    day.icon
                }.png" alt="Weather icon" />
            </div>`;
        });
        document.getElementById("daily-weather").innerHTML = html;
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
        html = "";
        app.hourly.forEach((hour) => {
            html += `
            <div class="hourly-weather-list">
                <img width=100px height=100px src="icons/${hour.icon}.png" alt="Weather icon"/>
                <p>${hour.temp}</p>
                <p>${hour.date}</p>
            </div>`;
        });
        document.getElementById("hourly-weather").innerHTML = html;
    }
};

function search(e) {
    e.preventDefault();
    let city = document.getElementById("entry").value;
    if (city) {
        app.url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${app.key}&units=metric&lang=${app.lang}`;
        app.fetchData();
    }
}
