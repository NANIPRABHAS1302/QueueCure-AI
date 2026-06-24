# QueueCure-AI - Hackathon Presentation Blueprint

This document represents the slides framework, talking points, and pitch script for presenting **QueueCure-AI** to hackathon judges and mentors.

---

## Slide 1: The Healthcare Bottleneck (Problem)
- **Title**: Re-imagining the Hospital Waiting Lobby
- **The Pain Point**: 
  - Standard hospital queues are outdated FIFO lists.
  - Critical cases get delayed, leading to preventable health declines.
  - Patients face high anxiety due to vague waiting times.
  - Front-desk receptionists are overloaded with manual check-ins.
- **The Solution**: **QueueCure-AI** — A smart, real-time, priority-weighted hospital queue management and symptom-routing system.

---

## Slide 2: QueueCure-AI Architecture (System Blueprint)
- **Visuals**: (Refer to `docs/ARCHITECTURE.md` Mermaid diagrams)
- **Core Pillars**:
  - **Decoupled Frontend**: React SPA with a custom history-state router and TailwindCSS v4 glassmorphic styles.
  - **Real-Time Synchronizer**: Socket.io engine pushing tick updates to lobbies and mobile apps.
  - **Prioritized Scheduler**: Weighted sorting system prioritizing emergency status.
  - **AI Triage Integration**: Localized symptom-checker connecting patient triage to medical departments.

---

## Slide 3: Live Public Lobby & Digital Kiosks (User Experience)
- **Key Experience**:
  - **The Lobby Screen (`/queue`)**: Clean, large dashboard display with instant blinking tickers and acoustic calling indicators. No auth required.
  - **Dynamic Patient App**: Live token cards updating wait times down to the minute.
  - **Doctor Consultation Room**: "One-click call" console where doctors request the next patient and automatically send SMS/email alerts.

---

## Slide 4: Emergency Override & AI Symptom Checker (Special Features)
- **Priority Override**:
  - Receptionist inserts an emergency case; the system automatically pushes the patient to **Position #1** in the active queue.
  - Background SMS alerting adjusts next-in-line patient expectations immediately.
- **Symptom Chatbot**:
  - Interactive chat panel parses symptoms (e.g., "Severe chest discomfort").
  - Identifies specialized departments (e.g., Cardiology) and recommends matching practitioners instantly.

---

## Slide 5: Load-Testing with Programmatic Seeding (Tech Depth)
- **Synthetic Data**:
  - Programmatic CSV generator creating **1,000 patients**, **100 doctors**, **25 hospitals**, **5,000 appointments**, and **2,000 queues** on server startup.
  - Automatic MongoDB parsing to perform high-fidelity dry-runs of the priority engine.
- **Diagnostics Dashboard**:
  - Admin view displaying server telemetry (CPU load, memory GBs, uptime) alongside database collection volumes.

---

## Slide 6: The Roadmap (Future Scope)
- **Advanced Integrations**:
  - Integrate speech-to-text AI for kiosk walk-ins.
  - Implement face recognition for automatic medical card lookup at reception desks.
  - Connect LLMs (Gemini/GPT) for comprehensive offline medical summarization.
  - Support multi-hospital network federations.
