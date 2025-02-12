<template>
    <div class="page-container">
      <div class="blur-background"></div>
      <div class="scene-container">
        <!-- Background wall -->
        <div class="wall"></div>
        
        <!-- Chibi character -->
        <div class="chibi">
          <!-- Body parts -->
          <div class="head">
            <div class="eye left"></div>
            <div class="eye right"></div>
            <div class="smile"></div>
          </div>
          <div class="body"></div>
          <div class="arm-left"></div>
          <div class="arm-right"></div>
          <div class="leg-left"></div>
          <div class="leg-right"></div>
        </div>
        
        <!-- Puzzle piece -->
        <div class="puzzle-piece"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  // Component logic can be added here if needed
  </script>
  
  <style scoped>
  .page-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .blur-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(8px);
  }
  
  .scene-container {
    width: 300px;
    height: 300px;
    position: relative;
    background: rgba(240, 240, 240, 0.9);
    overflow: hidden;
    border-radius: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    z-index: 1;
  }
  
  .wall {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(224, 224, 224, 0.9);
    background-image: linear-gradient(45deg, rgba(208, 208, 208, 0.8) 25%, transparent 25%),
                      linear-gradient(-45deg, rgba(208, 208, 208, 0.8) 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, rgba(208, 208, 208, 0.8) 75%),
                      linear-gradient(-45deg, transparent 75%, rgba(208, 208, 208, 0.8) 75%);
    background-size: 20px 20px;
  }
  
  .chibi {
    position: absolute;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    animation: bounce 1s infinite ease-in-out;
    z-index: 2;
  }
  
  .head {
    width: 60px;
    height: 60px;
    background: #ffb7b7;
    border-radius: 50%;
    position: relative;
  }
  
  .eye {
    width: 8px;
    height: 8px;
    background: #333;
    border-radius: 50%;
    position: absolute;
    top: 25px;
  }
  
  .eye.left {
    left: 15px;
  }
  
  .eye.right {
    right: 15px;
  }
  
  .smile {
    width: 20px;
    height: 10px;
    border-bottom: 3px solid #333;
    border-radius: 50%;
    position: absolute;
    bottom: 15px;
    left: 20px;
  }
  
  .body {
    width: 40px;
    height: 50px;
    background: #ff9494;
    border-radius: 20px;
    position: absolute;
    top: 55px;
    left: 10px;
  }
  
  .arm-left, .arm-right {
    width: 15px;
    height: 40px;
    background: #ffb7b7;
    position: absolute;
    top: 60px;
  }
  
  .arm-left {
    left: -5px;
    transform-origin: top;
    animation: waveLeft 1s infinite ease-in-out;
  }
  
  .arm-right {
    right: -5px;
    transform-origin: top;
    animation: waveRight 1s infinite ease-in-out;
  }
  
  .leg-left, .leg-right {
    width: 15px;
    height: 30px;
    background: #ffb7b7;
    position: absolute;
    top: 100px;
  }
  
  .leg-left {
    left: 5px;
  }
  
  .leg-right {
    right: 5px;
  }
  
  .puzzle-piece {
    width: 40px;
    height: 40px;
    background: #4CAF50;
    position: absolute;
    right: 80px;
    top: 100px;
    clip-path: path('M 0,0 L 40,0 L 40,40 L 0,40 L 0,0 M 20,0 L 25,5 L 15,5 L 20,0 M 40,20 L 35,25 L 35,15 L 40,20');
    animation: floatPiece 2s infinite ease-in-out;
    z-index: 2;
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    50% {
      transform: translateX(-50%) translateY(-10px);
    }
  }
  
  @keyframes waveLeft {
    0%, 100% {
      transform: rotate(-20deg);
    }
    50% {
      transform: rotate(20deg);
    }
  }
  
  @keyframes waveRight {
    0%, 100% {
      transform: rotate(20deg);
    }
    50% {
      transform: rotate(-20deg);
    }
  }
  
  @keyframes floatPiece {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-15px) rotate(5deg);
    }
  }
  </style>