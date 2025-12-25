# 🌾 AgriQuest: Neural Farm OS (v2.0)

**AgriQuest** is an elite, mobile-first Agricultural Decision Support System (DSS) designed to solve the "last mile" of farming intelligence. It transforms raw environmental data into actionable human advice through a multimodal neural core.

---

## 👨‍💻 Lead Developer
**Aadhavan** — *Full-Stack AI Architect*

---

## 🚀 Dual-Role Ecosystem

### 🚜 For Farmers: Precision & Sustainability
*   **Multimodal Field Scanner:** Real-time crop pathology (Hyperspectral simulation) and Livestock Biometrics (length, height, girth extraction).
*   **Live AI Advisor:** Multilingual voice-to-voice interaction for hands-free troubleshooting in native Indian languages.
*   **Variable Rate Prescription (VRP):** Precise KG/HA fertilizer recommendations fused with 7-day weather logic.
*   **Smart Minting:** Secure harvest batches on a decentralized ledger with IoT Oracle verification.

### 🏢 For Buyers & Resellers: Trusted Procurement
*   **Seed-to-Shelf Ledger:** Immutable record of a crop's journey including fertilizer logs and cold-chain temperature history.
*   **QR Traceability:** Publicly verifiable QR codes for consumers to audit sustainability scores.
*   **Automated Escrow:** Payments released automatically upon logistics verification via Smart Contracts.

---

## 🧠 Neural Architecture (Powered by Google Gemini)

### 📸 Diagnostic Layer (`gemini-3-flash-preview`)
*   **Spectral HUD:** Moving beyond RGB to simulate NDVI and Thermal plant stress.
*   **Livestock Intelligence:** Extracting biometric parameters from 2D images to provide objective health grades.

### 🧠 Advisory Layer (`gemini-3-pro-preview` & `gemini-2.5-flash-native-audio`)
*   **Voice-First UX:** Low-latency voice interaction via Gemini Live API.
*   **Predictive Alerting:** 7-day time-series forecasting for pest outbreaks and market price drops.

### 🔍 Grounding Layer (`googleSearch` & `googleMaps`)
*   **Mandi Oracle:** Today's live crop prices and selling signals based on real-time web grounding.
*   **Resource Discovery:** Localized lab and research center sourcing via GPS grounding.

---

## 📦 Deployment & Requirements

1.  **Permissions:** Requires Camera (Diagnostics), Microphone (Voice Advisor), and Geolocation (Precision Weather/Grounding).
2.  **Environment:** API Key injected via `process.env.API_KEY`.
3.  **Connectivity:** Optimized with offline buffering for 2G/low-bandwidth environments.

---
*AgriQuest: Building trust from Seed to Shelf.*