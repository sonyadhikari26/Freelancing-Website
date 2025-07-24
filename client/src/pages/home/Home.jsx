import React from "react";
import "./Home.scss";
import Featured from "../../components/featured/Featured";
import TrustedBy from "../../components/trustedBy/TrustedBy";
import Slide from "../../components/slide/Slide";
import CatCard from "../../components/catCard/CatCard";
import ProjectCard from "../../components/projectCard/ProjectCard";
import { cards, projects } from "../../data";

function Home() {
  return (
    <div className="home">
      <Featured />
      <div className="explore">
        <div className="container">
          <h1>Explore the marketplace</h1>
          <div className="items">
            <div className="item">
              <img src="./img/design.svg" alt="" />
              <div className="line"></div>
              <span>Graphics & Design</span>
            </div>
            <div className="item">
              <img src="./img/marketing.svg" alt="" />
              <div className="line"></div>

              <span>Digital Marketing</span>
            </div>
            <div className="item">
              <img src="./img/writing.svg" alt="" />
              <div className="line"></div>
              <span>Writing & Translation</span>
            </div>
            <div className="item">
              <img src="./img/video.svg" alt="" />
              <div className="line"></div>
              <span>Video & Animation</span>
            </div>
            <div className="item">
              <img src="./img/audio.svg" alt="" />
              <div className="line"></div>
              <span>Music & Audio</span>
            </div>
            <div className="item">
              <img src="./img/programming.svg" alt="" />
              <div className="line"></div>
              <span>Programming & Tech</span>
            </div>
            <div className="item">
              <img src="./img/business.svg" alt="" />
              <div className="line"></div>
              <span>Business</span>
            </div>
            <div className="item">
              <img src="./img/lifestyle.svg" alt="" />
              <div className="line"></div>
              <span>Lifestyle</span>
            </div>
            <div className="item">
              <img src="./img/data.svg" alt="" />
              <div className="line"></div>
              <span>Data</span>
            </div>
            <div className="item">
              <img src="./img/camera.svg" alt="" />
              <div className="line"></div>
              <span>Photography</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
