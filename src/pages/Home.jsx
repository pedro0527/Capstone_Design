import "../App.css";
import styled from "styled-components";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WebSocketManager } from "../ws/WebSocketManager";
import person from "../assets/person_white.svg";

function Home() {
  const [clock, setClock] = useState(getNowTime());
  const [weather, setWeather] = useState(null);
  const navigate = useNavigate();
  const [hasNavigated, setHasNavigated] = useState(false);

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

  useEffect(() => {
    WebSocketManager.connect();

    const handler = (data) => {
      console.log("[Home] 수신 데이터:", data);

      if (
        data.type?.includes("face") &&
        data.value !== "failed to detect face"
      ) {
        console.log("[Home] 얼굴 인식 → /face로 이동");
        navigate("/face");
      }
    };

    WebSocketManager.onMessage(handler);

    return () => {
      WebSocketManager.removeMessageHandler(handler);
    };
  }, []);

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
      <ImgWrapper>
        <Image src={person}></Image>
      </ImgWrapper>
    </Wrapper>
  );
}

export default Home;

// ✅ 스타일 컴포넌트
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

const ImgWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 88vw;
`;

const Image = styled.img`
  width: 500px;
  color: white;
`;
