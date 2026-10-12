# MineWatch

Create a highly professional, interactive single-page civic dashboard called MineWatch. The app serves as a community infrastructure tool to help residents in Pennsylvania's 8th Congressional District check and understand abandoned mine subsidence risks.

Use a clean, authoritative design system with a deep charcoal, slate-gray, and safety-orange accent palette (representing civic geology, structural awareness, and infrastructure). Ensure a responsive layout design, beautiful layout cards, and crisp typography using Tailwind CSS styling.

At the top of the dashboard, create a header featuring the app name, a distinct geological shield icon, and a dropdown selector labeled "Select PA-08 Zip Code to Check Subsidence Risk". Provide these three precise choices representing major areas in the district: 

1. 18503 (Scranton Downtown)

2. 18702 (Wilkes-Barre Center)

3. 18706 (Hanover Township / Wilkes-Barre South)

Main Dashboard Layout:

1. CENTRAL RISK DIAL: Display a large, animated visual ring showing a "Subsidence Risk Level Score" out of 100. Color-code dynamically (Green for Low Risk <40, Yellow for Moderate Risk 40-70, Red for Critical Risk >70).

2. PROPERTY SUMMARY CARDS: Below the dial, create three data cards with custom icons:

   - Historical Mining Depth: Shows estimated depth of abandoned veins (e.g., "120 feet below surface"). Add a text badge indicating a specific historical local coal vein name (e.g., "Dunmore Vein #3" or "Baltimore Vein").

   - Soil Stability Rating: Shows geological stability status (Stable, Shifting, Active Monitoring).

   - Insurance Eligibility: Displays whether the zone qualifies for the state's Mine Subsidence Insurance (MSI) program (e.g., "Highly Recommended - 100% Eligible").

Advanced Interactive Features:

- RISK SIMULATOR TOGGLE: Add an interactive switch labeled "View Heavy Rainfall Impact". When toggled ON, visually animate the risk score rising by +12 points and show an alert badge explaining that heavy groundwater shifts the soil in old underground mine voids.

- STATE RESOURCES CONSOLE: At the bottom, display a section titled "Congressional & State Action Protocol". Automatically print out two tailored resource links and guidance steps based on the chosen zip code’s risk level (specifically referencing direct instructions on how to apply for the PA Department of Environmental Protection MSI program).

- REPORT GENERATOR: Add a functional button labeled "Generate Homeowner Risk Briefing" that triggers a clean print-ready summary of the active screen data.

Data Variations to Build In:

- 18503 (Scranton Downtown): Risk Score 58 (Moderate). Mining Depth: 210ft. Soil: Active Monitoring. Insurance: Recommended. Worst metric is Mining Depth.

- 18702 (Wilkes-Barre Center): Risk Score 82 (Critical). Mining Depth: 95ft (Very shallow historical veins). Soil: Shifting. Insurance: Critical Priority. Worst metric is Soil Stability and shallow depth.

- 18706 (Hanover Township): Risk Score 34 (Low). Mining Depth: 480ft (Deep, stable rock layers). Soil: Stable. Insurance: Optional / Peace of Mind. All metrics performing well.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://minewatchpa08.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1e6e1b12-6f7e-49e7-b78a-dcb327287c77).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
