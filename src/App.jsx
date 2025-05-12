import "./App.css";
import styled from "styled-components";
import { useState } from "react";

function App() {
  const nowTime = () => {
    let now = new Date();
    let hour = String(now.getHours()).padStart(2, "0");
    let minute = String(now.getMinutes()).padStart(2, "0");
    let second = String(now.getSeconds()).padStart(2, "0");

    return `${hour} : ${minute} : ${second}`;
  };
  const [clock, setclock] = useState(nowTime);
  setInterval(() => setclock(nowTime), 1000);

  return (
    <Wrapper>
      <Clock>{clock}</Clock>
    </Wrapper>
  );
}

export default App;

const Wrapper = styled.section`
  display: flex;
  width: 88vw;
  height: 88vh;
`;
const Clock = styled.div`
  display: flex;
  justify-content: flex-start;
  font-size: 25px;
`;
