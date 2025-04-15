let grass, pademelons, devils, bandicoots, chart;
let season = 0; // 0: Spring, 1: Summer, 2: Autumn, 3: Winter
let seasonDuration = 300;
let showSeasons = true;
let showDisasters = true;
let disasterDuration = 100;
let disasterFrame = -disasterDuration;
let isPaused = false;
let grassLimitEnabled = true;
let points = 0;
let stabilityCheckFrames = 0;
const stabilityThreshold = 1000;
const stabilityPoints = 50;
const rangerBadgePoints = 1500;
let rangerBadgeAchieved = false;
let rangerBadgeMessageShown = false;

// Speed control variables
let speedMultiplier = 1;
let lastFrameTime = performance.now();
let customFrameCount = 0;

let objectives = [
  { description: "Increase pademelon population to 200", target: 200, achieved: false, points: 200 },
  { description: "Increase pademelon population to 250", target: 250, achieved: false, points: 250 },
  { description: "Increase devil population to 80", target: 80, achieved: false, points: 200 },
  { description: "Increase grass population to 900", target: 900, achieved: false, points: 200 },
  { description: "Survive 8 natural disasters", target: 8, achieved: false, points: 100, count: 0 },
  { description: "Maintain a stable ecosystem for 4000 frames", target: 4000, achieved: false, points: 100 },
  { description: "Increase bandicoot population to 130", target: 130, achieved: false, points: 200 }
];

let ongoingObjectives = [
  { description: "Maintain grass population above 700 for 800 frames", target: 800, achieved: false, points: 300, type: "grass", condition: (grass) => grass > 700 },
  { description: "Maintain pademelon population above 220 for 800 frames", target: 800, achieved: false, points: 300, type: "pademelons", condition: (pademelons) => pademelons > 220 },
  { description: "Maintain devil population above 70 for 800 frames", target: 800, achieved: false, points: 300, type: "devils", condition: (devils) => devils > 70 },
  { description: "Maintain bandicoot population above 90 for 800 frames", target: 800, achieved: false, points: 300, type: "bandicoots", condition: (bandicoots) => bandicoots > 90 },
  { description: "Maintain a balanced ecosystem for 1500 frames", target: 1500, achieved: false, points: 500, type: "balanced", condition: (grass, pademelons, devils, bandicoots) => grass > 500 && pademelons > 100 && devils > 50 && bandicoots > 100 }
];

let newAchievements = [
  { description: "Ecosystem Guardian: Achieve all ongoing objectives", achieved: false, points: 500 },
  { description: "Disaster Resilience: Survive 20 natural disasters", achieved: false, count: 0, target: 20, points: 200 },
  { description: "Master Ecologist: Maintain a stable ecosystem for 10,000 frames", achieved: false, frames: 0, target: 10000, points: 400 },
  { description: "Population Expert: Achieve grass population of 1500, pademelon population of 350, devil population of 150, and bandicoot population of 200", achieved: false, points: 400 }
];

function updateObjectiveDisplay() {
  const currentObjective = objectives.find(objective => !objective.achieved);
  const currentOngoingObjective = ongoingObjectives.find(objective => !objective.achieved);

  if (currentObjective) {
    document.getElementById("objectiveDisplay").innerText = currentObjective.description;
  } else if (currentOngoingObjective) {
    document.getElementById("objectiveDisplay").innerText = currentOngoingObjective.description;
  } else {
    document.getElementById("objectiveDisplay").innerText = "All objectives achieved! Complete achievements to earn more points.";
  }
}

let pademelonsHistory = [];
let devilsHistory = [];
let bandicootsHistory = [];
const historyLength = 100;

let achievements = [
  { description: "Survive 10 natural disasters", achieved: false, count: 0, target: 10, points: 100 },
  { description: "Maintain a stable ecosystem for 5000 frames", achieved: false, frames: 0, target: 5000, points: 50 }
];

// Variables for interpolation
let targetRainfall, targetTemperature;
let currentRainfall, currentTemperature;
const interpolationSpeed = 0.01;

function setup() {
  createCanvas(800, 400).parent("canvas-container");
  chart = new Chart(document.getElementById("populationChart"), {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: "Grass (per hectare)", data: [], borderColor: "green", fill: false },
        { label: "Pademelons (per hectare)", data: [], borderColor: "orange", fill: false },
        { label: "Devils (per hectare)", data: [], borderColor: "red", fill: false },
        { label: "Bandicoots (per hectare)", data: [], borderColor: "yellow", fill: false }
      ]
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        x: { title: { display: true, text: 'Time' }},
        y: { 
          title: { display: true, text: 'Population' },
          min: 0
        }
      }
    }
  });

  // Initialize speed control
  const speedSlider = document.getElementById("speedSlider");
  const speedValue = document.getElementById("speedValue");
  
  speedSlider.addEventListener("input", () => {
    speedMultiplier = parseFloat(speedSlider.value);
    speedValue.textContent = speedMultiplier.toFixed(1) + "x";
  });

  resetSim();
  targetRainfall = currentRainfall = parseFloat(document.getElementById("rainfall").value);
  targetTemperature = currentTemperature = parseFloat(document.getElementById("temperature").value);
  
  // Start the custom game loop
  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  if (!isPaused) {
    const deltaTime = timestamp - lastFrameTime;
    
    // Only update when enough time has passed based on speed multiplier
    if (deltaTime >= (16 / speedMultiplier)) {
      update();
      draw();
      customFrameCount++;
      lastFrameTime = timestamp;
    }
  }
  
  requestAnimationFrame(gameLoop);
}

function update() {
  // Seasonal changes
  if (customFrameCount % seasonDuration === 0) {
    let seasonNames = ["Spring", "Summer", "Autumn", "Winter"];
    season = (season + 1) % 4;
    document.getElementById("seasonDisplay").innerText = "Season: " + seasonNames[season];
    switch (season) {
      case 0: targetRainfall = 70; targetTemperature = 20; break;
      case 1: targetRainfall = 30; targetTemperature = 35; break;
      case 2: targetRainfall = 50; targetTemperature = 15; break;
      case 3: targetRainfall = 40; targetTemperature = 5; break;
    }
  }

  // Interpolate current values
  currentRainfall += (targetRainfall - currentRainfall) * interpolationSpeed;
  currentTemperature += (targetTemperature - currentTemperature) * interpolationSpeed;

  // Get slider values
  let rainfall = currentRainfall + parseFloat(document.getElementById("rainfall").value) - 50;
  let temperature = currentTemperature + parseFloat(document.getElementById("temperature").value) - 25;
  let invasiveSpecies = parseFloat(document.getElementById("invasiveSpecies").value);
  let humanImpact = parseFloat(document.getElementById("humanImpact").value);

  // Ecosystem Dynamics
  grass += (rainfall / 15 - invasiveSpecies) - (50 - rainfall) / 10;

  // Pademelons
  pademelons += grass / 150 - devils / 10 - humanImpact - temperature / 8;
  if (temperature > 30) pademelons -= (temperature - 30) / 5;
  if (invasiveSpecies > 5) pademelons -= invasiveSpecies / 10;

  // Devils
  let devilGrowth = (pademelons / 60 + bandicoots / 40) * (1 - devils / (pademelons + bandicoots + 1)) - temperature / 10 - humanImpact / 5;
  if (temperature < 10 || temperature > 35) devilGrowth -= Math.abs(temperature - 22) / 10;
  if (humanImpact > 5) devilGrowth -= humanImpact / 5;
  devils += devilGrowth;

  // Bandicoots
  let bandicootGrowth = (grass / 250 + pademelons / 40) * (1 - bandicoots / (grass + 1)) - devils / 8 - invasiveSpecies / 8 - humanImpact / 5;
  if (temperature > 25) bandicootGrowth -= (temperature - 25) / 5;
  if (invasiveSpecies > 5) bandicootGrowth -= invasiveSpecies / 5;
  if (humanImpact > 5) bandicootGrowth -= humanImpact / 5;
  bandicoots += bandicootGrowth;

  // Population caps
  let devilLimit = (pademelons + bandicoots) * 0.5;
  if (devils > devilLimit) devils = devilLimit;

  let bandicootLimit = grass * 0.12;
  if (bandicoots > bandicootLimit) bandicoots = bandicootLimit;
  if (bandicoots < devils * 0.5) bandicoots = devils * 0.5;

  // Constrain Populations
  if (grassLimitEnabled) grass = constrain(grass, 0, 1000);
  else grass = max(grass, 0);
  pademelons = max(pademelons, 0);
  devils = max(devils, 0);
  bandicoots = max(bandicoots, 0);

  // Natural Disasters
  if (customFrameCount % 1000 === 0 && showDisasters) {
    triggerRandomEvent();
  }

  // Track population history
  pademelonsHistory.push(pademelons);
  devilsHistory.push(devils);
  bandicootsHistory.push(bandicoots);
  if (pademelonsHistory.length > historyLength) {
    pademelonsHistory.shift();
    devilsHistory.shift();
    bandicootsHistory.shift();
  }

  checkEcosystemStability();
  updatePoints();
}

function draw() {
  if (isPaused) return;

  let seasonColors = ["#d4f1f4", "#f7d794", "#f5cd79", "#c8d6e5"];
  background(showSeasons ? seasonColors[season] : 240);

  // Visualize populations
  fill("green"); ellipse(200, height / 2, grass);
  fill("orange"); ellipse(400, height / 2, pademelons);
  fill("red"); ellipse(600, height / 2, devils);
  fill("yellow"); ellipse(800, height / 2, bandicoots);

  // Update chart
  chart.data.labels.push(customFrameCount);
  chart.data.datasets[0].data.push(grass);
  chart.data.datasets[1].data.push(pademelons);
  chart.data.datasets[2].data.push(devils);
  chart.data.datasets[3].data.push(bandicoots);
  chart.update();
  if (chart.data.labels.length > 100) {
    chart.data.labels.shift();
    chart.data.datasets.forEach(dataset => dataset.data.shift());
  }

  // Narrative events
  if (customFrameCount % 500 === 0) triggerNarrativeEvent();

  // Hide disaster message after duration
  if (customFrameCount - disasterFrame > disasterDuration) {
    document.getElementById("disasterMessage").style.display = "none";
  }

  updatePointsDisplay();
  updateObjectiveDisplay();
  checkAchievements();
}

function triggerNarrativeEvent() {
  if (currentRainfall < 20) {
    showNarrativeMessage("A dry spell has reduced grass availability. Herbivores are struggling—can you balance the sliders to recover grass population?");
  } else if (parseFloat(document.getElementById("invasiveSpecies").value) > 11) {
    showNarrativeMessage("Invasive species are overwhelming native habitats. Adjust the sliders to control their spread!");
  } else if (grass < 100) {
    showNarrativeMessage("Grass levels are dangerously low. Can you restore balance to the ecosystem?");
  } else if (parseFloat(document.getElementById("humanImpact").value) > 6) {
    showNarrativeMessage("Human activities are significantly affecting the ecosystem. Adjust the sliders to mitigate the impact!");
  }
}

function showNarrativeMessage(message) {
  const narrativeElement = document.createElement("div");
  narrativeElement.className = "narrative-message";
  narrativeElement.innerText = message;
  document.body.appendChild(narrativeElement);
  setTimeout(() => {
    narrativeElement.style.opacity = "0";
    setTimeout(() => narrativeElement.remove(), 1000);
  }, 5000);
}

function resetSim() {
  grass = 100;
  pademelons = 50;
  devils = 10;
  bandicoots = 30;
  if (chart) {
    chart.data.labels = [];
    chart.data.datasets.forEach(dataset => dataset.data = []);
    chart.update();
  }
  customFrameCount = 0;
  lastFrameTime = performance.now();
  points = 0;
  objectives.forEach(obj => obj.achieved = false);
  pademelonsHistory = [];
  devilsHistory = [];
  bandicootsHistory = [];
  rangerBadgeAchieved = false;
  rangerBadgeMessageShown = false;
  document.getElementById("rangerBadge").style.display = "none";
  document.getElementById("medalIcon").style.display = "none";

  // Reset sliders
  document.getElementById("rainfall").value = 55;
  document.getElementById("rainfallValue").innerText = 55;
  document.getElementById("temperature").value = 25;
  document.getElementById("temperatureValue").innerText = 25;
  document.getElementById("invasiveSpecies").value = 5;
  document.getElementById("invasiveSpeciesValue").innerText = 5;
  document.getElementById("humanImpact").value = 2;
  document.getElementById("humanImpactValue").innerText = 2;

  targetRainfall = currentRainfall = 50;
  targetTemperature = currentTemperature = 25;

  updatePointsDisplay();
  updateObjectiveDisplay();
}

function updateValue(id) {
  document.getElementById(id + 'Value').innerText = document.getElementById(id).value;
}

function exportCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Time,Grass,Pademelons,Devils,Bandicoots\n";
  chart.data.labels.forEach((label, index) => {
    csvContent += `${label},${chart.data.datasets[0].data[index]},${chart.data.datasets[1].data[index]},${chart.data.datasets[2].data[index]},${chart.data.datasets[3].data[index]}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.appendChild(document.createTextNode("Download CSV"));
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function toggleSeasonsDisplay() {
  showSeasons = document.getElementById("toggleSeasons").checked;
}

function toggleDisasters() {
  showDisasters = document.getElementById("toggleDisasters").checked;
}

function togglePause() {
  isPaused = !isPaused;
  document.getElementById("pauseButton").innerText = isPaused ? "Resume" : "Pause";
}

document.addEventListener('keydown', function(event) {
  if (event.code === 'Space') {
    event.preventDefault();
    togglePause();
  }
});

function toggleGrassLimit() {
  grassLimitEnabled = !grassLimitEnabled;
  document.getElementById("toggleGrassLimitButton").innerText = grassLimitEnabled ? "Disable Grass Limit" : "Enable Grass Limit";
}

function updatePoints() {
  if (isPaused) return;

  objectives.forEach(objective => {
    if ((objective.description.includes("pademelon") && pademelons >= objective.target) ||
        (objective.description.includes("devil") && devils >= objective.target) ||
        (objective.description.includes("grass") && grass >= objective.target) ||
        (objective.description.includes("bandicoot") && bandicoots >= objective.target) ||
        (objective.description.includes("disasters") && objective.count >= objective.target) ||
        (objective.description.includes("4000 frames") && customFrameCount >= objective.target)) {
      if (!objective.achieved) {
        points += objective.points;
        objective.achieved = true;
        alert(`Objective Achieved: ${objective.description}\nPoints Awarded: ${objective.points}`);
        updateObjectiveDisplay();
      }
    }
  });

  ongoingObjectives.forEach(objective => {
    if ((objective.type === "grass" && grass > 700) ||
        (objective.type === "pademelons" && pademelons > 220) ||
        (objective.type === "devils" && devils > 70) ||
        (objective.type === "bandicoots" && bandicoots > 90) ||
        (objective.type === "balanced" && grass > 500 && pademelons > 100 && devils > 50 && bandicoots > 100)) {
      if (!objective.achieved) {
        objective.target--;
        if (objective.target <= 0) {
          points += objective.points;
          objective.achieved = true;
          alert(`Ongoing Objective Achieved: ${objective.description}\nPoints Awarded: ${objective.points}`);
          updateObjectiveDisplay();
        }
      }
    } else {
      objective.target = 800;
    }
  });

  if (points >= rangerBadgePoints && !rangerBadgeAchieved) {
    alert("Congratulations! You've earned the Ranger Badge!");
    document.getElementById("rangerBadge").style.display = "block";
    rangerBadgeAchieved = true;
  } else if (points >= 500 && !rangerBadgeAchieved && !rangerBadgeMessageShown) {
    alert("Great job! You're on your way to earning the Ranger Badge. Keep the ecosystem stable to achieve it!");
    rangerBadgeMessageShown = true;
  }
}

function updatePointsDisplay() {
  document.getElementById("pointsDisplay").innerText = points;
}

function checkEcosystemStability() {
  if (pademelonsHistory.length >= historyLength) {
    const avgPademelons = pademelonsHistory.reduce((a, b) => a + b, 0) / pademelonsHistory.length;
    const avgDevils = devilsHistory.reduce((a, b) => a + b, 0) / devilsHistory.length;
    const avgBandicoots = bandicootsHistory.reduce((a, b) => a + b, 0) / bandicootsHistory.length;

    if (Math.abs(avgPademelons - 50) < 10 && Math.abs(avgDevils - 10) < 5 && Math.abs(avgBandicoots - 30) < 10 &&
        avgPademelons > 0 && avgDevils > 0 && avgBandicoots > 0) {
      points += stabilityPoints;
      alert(`Ecosystem Stability Achieved!\nPoints Awarded: ${stabilityPoints}`);
      pademelonsHistory = [];
      devilsHistory = [];
      bandicootsHistory = [];
    }
  }

  let stabilityAchievement = achievements.find(ach => ach.description.includes("5000 frames"));
  if (stabilityAchievement && !stabilityAchievement.achieved && customFrameCount >= stabilityAchievement.target && 
      grass > 0 && pademelons > 0 && devils > 0 && bandicoots > 0) {
    stabilityAchievement.achieved = true;
    points += stabilityAchievement.points;
    alert(`Achievement Unlocked: ${stabilityAchievement.description}\nPoints Awarded: ${stabilityAchievement.points}`);
    updatePointsDisplay();
    document.getElementById("achievementMessage").innerText = `Achievement Unlocked: ${stabilityAchievement.description}`;
    document.getElementById("achievementMessage").style.display = "block";
    setTimeout(() => document.getElementById("achievementMessage").style.display = "none", 3000);
  }

  let masterEcologist = newAchievements.find(ach => ach.description.includes("10,000 frames"));
  if (masterEcologist && !masterEcologist.achieved && customFrameCount >= masterEcologist.target && 
      grass > 0 && pademelons > 0 && devils > 0 && bandicoots > 0) {
    masterEcologist.achieved = true;
    points += masterEcologist.points;
    alert(`Achievement Unlocked: ${masterEcologist.description}\nPoints Awarded: ${masterEcologist.points}`);
    updatePointsDisplay();
    displayAchievement(masterEcologist.description);
  }
}

function triggerRandomEvent() {
  const events = ["bushfire", "flood", "disease outbreak"];
  handleEvent(events[Math.floor(Math.random() * events.length)]);
}

function handleEvent(event) {
  let disasterMessage = "";
  if (event === "bushfire") {
    grass -= 50; pademelons -= 20; devils -= 5; bandicoots -= 10;
    disasterMessage = "Bushfire Occurred!";
    background(255, 100, 100);
  } else if (event === "flood") {
    pademelons -= 10; bandicoots -= 5;
    disasterMessage = "Flood Occurred!";
    background(100, 100, 255);
  } else if (event === "disease outbreak") {
    devils -= 10; bandicoots -= 10;
    disasterMessage = "Disease Outbreak Occurred!";
    background(150, 0, 150);
  }
  
  document.getElementById("disasterMessage").innerText = disasterMessage;
  document.getElementById("disasterMessage").style.display = "block";
  disasterFrame = customFrameCount;

  // Update objectives and achievements
  let disasterObjective = objectives.find(obj => obj.description.includes("disasters"));
  if (disasterObjective) {
    disasterObjective.count++;
    if (disasterObjective.count >= disasterObjective.target && !disasterObjective.achieved) {
      disasterObjective.achieved = true;
      points += disasterObjective.points;
      alert(`Objective Achieved: ${disasterObjective.description}\nPoints Awarded: ${disasterObjective.points}`);
      updatePointsDisplay();
      updateObjectiveDisplay();
    }
  }

  let disasterAchievement = newAchievements.find(ach => ach.description.includes("20 natural disasters"));
  if (disasterAchievement) {
    disasterAchievement.count++;
    if (disasterAchievement.count >= disasterAchievement.target && !disasterAchievement.achieved) {
      disasterAchievement.achieved = true;
      points += disasterAchievement.points;
      alert(`Achievement Unlocked: ${disasterAchievement.description}\nPoints Awarded: ${disasterAchievement.points}`);
      updatePointsDisplay();
      displayAchievement(disasterAchievement.description);
    }
  }
}

function checkAchievements() {
  let stabilityAchievement = achievements.find(ach => ach.description.includes("5000 frames"));
  if (stabilityAchievement && !stabilityAchievement.achieved && customFrameCount >= stabilityAchievement.target) {
    stabilityAchievement.achieved = true;
    points += stabilityAchievement.points;
    alert(`Achievement Unlocked: ${stabilityAchievement.description}\nPoints Awarded: ${stabilityAchievement.points}`);
    updatePointsDisplay();
    document.getElementById("achievementMessage").innerText = `Achievement Unlocked: ${stabilityAchievement.description}`;
    document.getElementById("achievementMessage").style.display = "block";
    setTimeout(() => document.getElementById("achievementMessage").style.display = "none", 3000);
  }

  let disasterAchievement = achievements.find(ach => ach.description.includes("10 natural disasters"));
  newAchievements.forEach(achievement => {
    if (!achievement.achieved) {
      if (achievement.description.includes("ongoing objectives") && ongoingObjectives.every(obj => obj.achieved)) {
        achievement.achieved = true;
        points += achievement.points;
        alert(`Achievement Unlocked: ${achievement.description}\nPoints Awarded: ${achievement.points}`);
        displayAchievement(achievement.description);
      } else if (achievement.description.includes("20 natural disasters") && disasterAchievement.count >= achievement.target) {
        achievement.achieved = true;
        points += achievement.points;
        alert(`Achievement Unlocked: ${achievement.description}\nPoints Awarded: ${achievement.points}`);
        displayAchievement(achievement.description);
      } else if (achievement.description.includes("10,000 frames") && customFrameCount >= achievement.target) {
        achievement.achieved = true;
        points += achievement.points;
        alert(`Achievement Unlocked: ${achievement.description}\nPoints Awarded: ${achievement.points}`);
        displayAchievement(achievement.description);
      } else if (achievement.description.includes("Population Expert") && grass >= 1500 && pademelons >= 350 && devils >= 150 && bandicoots >= 200) {
        achievement.achieved = true;
        points += achievement.points;
        alert(`Achievement Unlocked: ${achievement.description}\nPoints Awarded: ${achievement.points}`);
        displayAchievement(achievement.description);
      }
    }
  });
}

function displayAchievement(description) {
  const achievementElement = document.createElement("div");
  achievementElement.innerText = description;
  document.getElementById("achievementsContainer").appendChild(achievementElement);
}

document.querySelectorAll(".collapsible").forEach(button => {
  button.addEventListener("click", function() {
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
      this.setAttribute("aria-expanded", "false");
    } else {
      content.style.display = "block";
      this.setAttribute("aria-expanded", "true");
    }
  });
});

function showAnswer(id) {
  document.getElementById(id).style.display = 'block';
}