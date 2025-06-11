import React from "react";
import styled from "styled-components";
import { useState, useEffect } from "react";
import { WebSocketManager } from "../ws/WebSocketManager";
import { useNavigate } from "react-router-dom";

export const Arm = () => {
  const [clock, setClock] = useState(getNowTime());
  const [weather, setWeather] = useState(null);
  const navigate = useNavigate();
  const [armStatus, setArmStatus] = useState("unknown");

  function getNowTime() {
    const now = new Date();
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");
    return `${hour} : ${minute} : ${second}`;
  }

  useEffect(() => {
    WebSocketManager.connect();
    const handler = (data) => {
      if (data.type !== "arm") return;
      if (data.value === "abnormal" || data.value === "normal") {
        setArmStatus(data.value);
        localStorage.setItem("armResult", data.value);
        setTimeout(() => navigate("/voice"), 1000);
      }
    };
    WebSocketManager.onMessage(handler);
    return () => {
      WebSocketManager.removeMessageHandler(handler);
    };
  }, [navigate]);

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
      <Container>
        <Clock>{clock}</Clock>
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
              <Humidity>💧 {weather.humidity}%</Humidity>
            </Details>
          </WeatherBox>
        )}
      </Container>
      <Text>
        {armStatus === "abnormal" ? (
          <span>
            얼굴 비대칭이 감지되었습니다.
            <br />
            양팔의 움직임에도 이상이 있습니다.
          </span>
        ) : armStatus === "normal" ? (
          <span>
            얼굴 비대칭이 감지되었습니다.
            <br />
            양팔의 움직임은 정상입니다.
          </span>
        ) : (
          <span>
            얼굴 비대칭이 감지되었습니다.
            <br />
            양팔이 모두 화면에 나오게 들어주세요.
          </span>
        )}
      </Text>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  width: 88vw;
  height: 88vh;
`;

const Container = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Clock = styled.div`
  display: flex;
  height: 15vh;
  font-size: 30px;
  font-weight: 700;
  font-family: sans-serif;
  justify-content: center;
  align-items: center;
  color: white;
`;

const WeatherBox = styled.div`
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

const Text = styled.div`
  display: flex;
  justify-content: center;
  width: 88vw;

  span {
    color: white;
    font-weight: 700;
    font-family: sans-serif;
    font-size: 45px;
  }
`;
