import React from "react";
import UrlShortener from "../components/UrlShortener";
import Features from "../components/Features";
import Hero from "../components/Hero";

const API_BASE_URL = "http://localhost:5000";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <UrlShortener />
      <Features />
    </div>
  );
};

export default Home;
