import "./App.css";
import styled from "styled-components";
import { useState, useEffect } from "react";
import person from "./assets/person.svg";

function App() {
  const [clock, setClock] = useState(getNowTime());
  const [weather, setWeather] = useState(null);

  function getNowTime() {
    const now = new Date();
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");
    return `${hour} : ${minute} : ${second}`;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(getNowTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeather(lat, lon);
    });
  }, []);

  const fetchWeather = async (lat, lon) => {
    const { VITE_WEATHER_API_KEY } = import.meta.env;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${VITE_WEATHER_API_KEY}&units=metric&lang=kr`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);

      setWeather({
        temp: data.main.temp,
        temp_max: data.main.temp_max,
        temp_min: data.main.temp_min,
        humidity: data.main.humidity,
        desc: data.weather[0].description,
        icon: data.weather[0].icon,
        name: data.name,
      });
    } catch (err) {
      console.error("Failed to fetch weather:", err);
    }
  };

  return (
    <Wrapper>
      <Clock>{clock}</Clock>
      <Image src={person}></Image>
      {weather && (
        <WeatherBox>
          <Location>{weather.name}</Location>
          <WeatherTop>
            <Temp>{Math.round(weather.temp)}°</Temp>
            <WeatherRight>
              <Icon
                src={`https://openweathermap.org/img/w/${weather.icon}.png`}
              />
              <Description>{weather.desc}</Description>
            </WeatherRight>
          </WeatherTop>
          <Details>
            <Range>
              최고: {Math.round(weather.temp_max)}° 최저:{" "}
              {Math.round(weather.temp_min)}°
            </Range>
            <Humidity>💧 {weather.humidity}%</Humidity>
          </Details>
        </WeatherBox>
      )}
    </Wrapper>
  );
}

export default App;

// 스타일 컴포넌트
const Wrapper = styled.section`
  display: flex;
  justify-content: space-between;
  width: 88vw;
  height: 88vh;
`;

const Clock = styled.div`
  display: flex;
  width: 15vw;
  height: 15vh;
  font-size: 30px;
  font-weight: 700;
  font-family: sans-serif;
  justify-content: center;
  align-items: center;
`;

const WeatherBox = styled.div`
  padding: 20px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  color: white;
  text-align: center;
`;

const WeatherTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Temp = styled.div`
  font-size: 50px;
  margin-right: 10px;
`;

const WeatherRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Icon = styled.img`
  width: 50px;
  height: 50px;
`;

const Description = styled.div`
  font-size: 18px;
  margin-left: 10px;
`;

const Location = styled.h2`
  margin-bottom: 10px;
`;

const Details = styled.div`
  margin-top: 10px;
  font-size: 14px;
`;

const Range = styled.div`
  margin-bottom: 5px;
`;

const Humidity = styled.div``;

const Image = styled.img`
  width: 800px;
`;
