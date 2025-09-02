import React from "react";
import UrlShortener from "../components/UrlShortener";
import Features from "../components/Features";
import Hero from "../components/Hero";

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
