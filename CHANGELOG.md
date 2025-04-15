# 📜 Changelog – Ecosystem Simulator

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [2.0.0] - 2024-06-20
### Added
- **Lotka-Volterra predator-prey dynamics**
  - Prey growth rate (α): 0.04
  - Predation rate (β): 0.03
  - Predator death rate (γ): 0.02
  - Energy conversion efficiency (δ): 0.3

- **Genetic trait system**
  - Predator traits: speed (1-10), aggression (1-10), size (1-5)
  - Prey traits: speed (1-10), camouflage (1-10), fertility (1-5)
  - 5% mutation chance during reproduction

- **Environmental systems**
  - Seasonal cycle (spring/summer/autumn/winter) affecting:
    - Carrying capacity (±30%)
    - Trait effectiveness
  - Random disasters (1% daily chance):
    - Drought: reduces plants, increases predator aggression
    - Flood: population reduction
    - Disease: targets dominant species

### Changed
- **Population dynamics**
  - Implemented carrying capacity limits
  - Added phase space visualization
  - Enhanced chart tooltips with trait data

- **UI improvements**
  - New organism inspection panel
  - Real-time trait distribution charts
  - Disaster alert system

### Fixed
- Stabilized simulation balance
- Prevented population crashes
- Improved performance with 500+ entities

---

## [1.0.0] - 2023-11-15
### Initial Release
- Basic 3D ecosystem visualization
- Predator/prey spawning
- Simple population graphs
- React control panel