import React from "react";
import styled from "styled-components";
import { useState, useEffect } from "react";
import { WebSocketManager } from "../ws/WebSocketManager";
import { useNavigate } from "react-router-dom";

export const Result = () => {
  const [clock, setClock] = useState(getNowTime());
  const [weather, setWeather] = useState(null);
  const [faceResult, setFaceResult] = useState(() =>
    localStorage.getItem("faceResult")
  );
  const [armResult, setArmResult] = useState(() =>
    localStorage.getItem("armResult")
  );
  const [voiceResult, setVoiceResult] = useState(() =>
    localStorage.getItem("voiceResult")
  );
  const [finalResult, setFinalResult] = useState(null);
  const navigate = useNavigate();

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
      if (!data || typeof data !== "object") return;

      if (data.type === "final") {
        console.log("[Result] 최종 결과 수신:", data);
        setFinalResult(data.value);

        const face = localStorage.getItem("faceResult");
        const arm = localStorage.getItem("armResult");
        const voice = localStorage.getItem("voiceResult");

        console.log("🧠 진단 결과 요약:");
        console.log(" - 얼굴 결과:", face);
        console.log(" - 팔 결과:", arm);
        console.log(" - 음성 결과:", voice);
      }
    };
    WebSocketManager.onMessage(handler);
    return () => WebSocketManager.removeMessageHandler(handler);
  }, []);

  useEffect(() => {
    if (finalResult === "abnormal" || finalResult === "normal") {
      const timer = setTimeout(() => {
        WebSocketManager.disconnect();
        localStorage.removeItem("faceResult");
        localStorage.removeItem("armResult");
        localStorage.removeItem("voiceResult");
        localStorage.removeItem("diagnosisStarted");
        navigate("/");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [finalResult, navigate]);

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
      <ResultWrapper>
        <ResultText>
          최종 결과:{" "}
          {finalResult === "abnormal"
            ? "⚠️ 뇌졸중 의심"
            : finalResult === "normal"
            ? "✅ 정상"
            : "⏳ 검사 중"}
        </ResultText>
        <Table>
          <Face>
            <Text>얼굴 비대칭</Text>
            <Text>
              {faceResult === "abnormal"
                ? "O"
                : faceResult === "normal"
                ? "X"
                : "-"}
            </Text>
          </Face>
          <Arm>
            <Text>팔 비대칭</Text>
            <Text>
              {armResult === "abnormal"
                ? "O"
                : armResult === "normal"
                ? "X"
                : "-"}
            </Text>
          </Arm>
          <Voice>
            <Text>말 어눌함</Text>
            <Text>
              {voiceResult === "abnormal"
                ? "O"
                : voiceResult === "normal"
                ? "X"
                : "-"}
            </Text>
          </Voice>
        </Table>
      </ResultWrapper>
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

const ResultWrapper = styled.section`
  height: 30vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ResultText = styled.div`
  display: flex;
  justify-content: center;
  width: 88vw;
  color: red;
  font-size: 36px;
  font-weight: 800;
  font-family: sans-serif;
  margin-bottom: 20px;
`;

const Table = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
`;

const Face = styled.div`
  display: flex;
  flex-direction: column;
  width: 33%;
  padding: 10px;
`;

const Arm = styled.div`
  display: flex;
  flex-direction: column;
  width: 33%;
  padding: 10px;
`;

const Voice = styled.div`
  display: flex;
  flex-direction: column;
  width: 33%;
  padding: 10px;
`;

const Text = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 500;
  font-family: sans-serif;
  border: 1px solid white;
  padding: 10px;
`;
