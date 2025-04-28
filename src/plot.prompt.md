You are helping me build a professional project dashboard.

## 🌟 Project Context:
My project is titled **"Sleep Quality and Daily Activity: Understanding Personal Health Patterns"**.

I have wearable device data (Apple Watch) and self-reported surveys about daily behaviors like:
- Sleep stages (REM, Deep, Core)
- Step counts, heart rate, HRV
- Morning/afternoon energy levels, mood
- Caffeine/alcohol intake
- Workload stress, nap tendency, dinner timing

My goal is to analyze how daily activities and feelings impact sleep quality, energy, and overall well-being.

---

## 📚 Provided Materials:
- I will **attach a document** plots.tx that contains **Python (Plotly) code** for generating 10 key graphs.
- You must **reference that document** carefully.
- **Convert all Python/Plotly graphs to equivalent JavaScript (D3.js) visualizations.**

---

## 📐 Dashboard Requirements:

### 1. Technology Stack:
- **React.js** (Frontend Framework)
- **Tailwind CSS** (For styling - clean, responsive UI)
- **D3.js** (For recreating all the visualizations)

---

### 2. Component Structure:
- Create a **separate React component (.jsx file)** for **each chart**.
- So there should be **10 individual components**, each rendering one D3 chart.

Example:
```
/components
  Chart1_SleepQualityVsTotalSleep.jsx
  Chart2_MorningEnergyVsDeepSleep.jsx
  Chart3_CaffeineVsREMSleep.jsx
  Chart4_ActivityTimingVsSleep.jsx
  Chart5_MoodVsSleepStages.jsx
  Chart6_WorkloadVsSleep.jsx
  Chart7_AfternoonEnergyVsSleep.jsx
  Chart8_NapVsSleep.jsx
  Chart9_DinnerTimeVsSleep.jsx
  Chart10_OverallDayQualityVsSleep.jsx
```

---

### 3. Dashboard Page:
- Create a main **Dashboard.jsx** page that:
  - Has a **navigation menu** or **tabs/buttons** to switch between the 10 graphs.
  - **On top**: Show the selected chart.
  - **Below the chart**: Display a **description** (brief explanation) of what the graph shows.

---

### 4. Chart Positioning:
- **Top Section**: D3.js chart
- **Bottom Section**: Chart description (can be static text from me or placeholders now)

---

### 5. Additional Instructions:
- Ensure **smooth navigation** (like tabs or a sidebar).
- Charts should **resize responsively** for desktop/tablet/mobile using Tailwind classes.
- Add **simple animated transitions** between charts if possible (like fade-in or slide-in) to enhance user experience.
- Follow **good folder structure and modular code** practices.
- Keep code readable and maintainable.

---

## 📢 Important Notes:
- Carefully **study the attached Python plotting file**.
- **Translate the graphs thoughtfully** to D3.js equivalents, preserving:
  - Axis labels
  - Color mappings
  - Titles
  - Legends if applicable
- Don't use simple `<img>` screenshots — fully reimplement in D3.js.
- Maintain **semantic HTML structure** wherever possible.

---

## 🛠 Deliverables Expected:
- A full React project structure
- 10 individual JSX chart components
- A main Dashboard page to navigate between them
- Tailwind CSS styling
- D3.js used for rendering graphs

---

# 🎯 Final reminder:
Please read the attached plotting document carefully.  
Adapt the graphs **intelligently** to D3.js and **organize code very well** in React + Tailwind structure.  
Focus on clean UI, user experience, and code quality.