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
