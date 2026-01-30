import React from "react";
import "./styles.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components
import Layout from "./components/Layout";
import ChatboxButton from "./components/ChatboxButton";

// Pages
import Dashboard from "./pages/Dashboard";
import ProgramAvatar from "./pages/ProgramAvatar";
import Challenges from "./pages/Challenges";
import GoalsProgress from "./pages/GoalsProgress";
import ActivityFoodLog from "./pages/ActivityFoodLog";
import Notifications from "./pages/Notifications";
import Chatbot from "./pages/Chatbot";
import Welcome from "./pages/Welcome";
import LogIn from './pages/LogIn'; 
import SignUp from './pages/SignUp'; 


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ----------------------------------------------- */}
        {/* GROUP 1:  No Sidebar, No Layout                 */}
        {/* ----------------------------------------------- */}
        <Route path="/" element={<Welcome />} />
        <Route path="/LogIn" element={<LogIn />} />   
        <Route path="/SignUp" element={<SignUp />} />

        {/* ----------------------------------------------- */}
        {/* GROUP 2: app pages (With Sidebar & Chatbox)     */}
        {/* use "/*" to catch all other links and apply  */}
        {/* the Layout to them.                             */}
        {/* ----------------------------------------------- */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="program" element={<ProgramAvatar />} />
                <Route path="challenges" element={<Challenges />} />
                <Route path="goals" element={<GoalsProgress />} />
                <Route path="activity-food" element={<ActivityFoodLog />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="chatbot" element={<Chatbot />} />
              </Routes>
              
              
              <ChatboxButton />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
