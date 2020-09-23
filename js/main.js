(function init() {
    document.getElementById("entry").placeholder = "Search for a city";
    document.getElementById("search").addEventListener("click", search, false);
    function layoutCurrentWeather() {
        html = `            
        <div id="weather">
            <h1 id="city">?</h1>
            <p id="temp">-°C</p>
            <div id="icon">
                <img src="icons/unknown.png" alt="Weather icon" />
            </div>
            <p id="description">?</p>
            <p id="temps">-°C / -°C</p>
        </div>`;
        document.getElementById("current-weather").innerHTML = html;
    }

    function layoutDailyWeather() {
        html = "";
        for (var i = 0; i < 8; i++) {
            html += `
        <div class="daily-weather-list">
            <p id="daily-date-${i}">-/-/-</p>
            <div id="daily-icon-${i}">
                <img src="icons/unknown.png" alt="Weather icon" />
            </div>
            <p id="daily-temps-${i}">-°C / -°C</p>
        </div>`;
        }
        document.getElementById("daily-weather").innerHTML = html;
    }

    function layoutHourlyWeather() {
        html = "";
        for (var i = 0; i < 24; i++) {
            html += `
            <div class="hourly-weather-list">
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

    function draw() {
        layoutCurrentWeather();
        layoutHourlyWeather();
        layoutDailyWeather();
    }
    draw();
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
        .then(app.saveDaily)
        .then(app.showDaily)
        .then(app.saveHourly)
        .then(app.showHourly)
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
        let city = document.getElementById("city");
        let temp = document.getElementById("temp");
        let icon = document.getElementById("icon");
        let description = document.getElementById("description");
        let temps = document.getElementById("temps");
        city.textContent = app.currentWeather.city;
        temp.textContent = app.currentWeather.temp;
        icon.innerHTML = `<img src="icons/${app.currentWeather.icon}.png" alt="Weather icon"/>`;
        description.textContent = app.currentWeather.description;
        temps.textContent = `${
            app.currentWeather.tempMin + " / " + app.currentWeather.tempMax
        }`;
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
        let count = 0;
        app.daily.forEach((day) => {
            let date = document.getElementById(`daily-date-${count}`);
            let icon = document.getElementById(`daily-icon-${count}`);
            let temp = document.getElementById(`daily-temps-${count}`);
            date.textContent = day.date;
            icon.innerHTML = `<img src="icons/${day.icon}.png" alt="Weather icon"/>`;
            temp.textContent = `${day.tempMin + " / " + day.tempMax}`;
            count++;
        });
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
