import React from "react";
import "./styles.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ChatboxButton from "./components/ChatboxButton";
import Dashboard from "./pages/Dashboard";
import ProgramAvatar from "./pages/ProgramAvatar";
import Challenges from "./pages/Challenges";
import GoalsProgress from "./pages/GoalsProgress";
import ActivityFoodLog from "./pages/ActivityFoodLog";
import Notifications from "./pages/Notifications";
import Chatbot from "./pages/Chatbot";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/program" element={<ProgramAvatar />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/goals" element={<GoalsProgress />} />
          <Route path="/activity-food" element={<ActivityFoodLog />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>
        <ChatboxButton />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
