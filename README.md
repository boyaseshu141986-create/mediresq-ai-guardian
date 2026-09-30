# HealthFlow AI

Build a complete modern AI-powered healthcare supply-chain resilience web application called "MediResQ AI".



PROJECT PURPOSE:



MediResQ AI helps hospitals predict medicine shortages, forecast medicine demand, manage inventory, detect medicines approaching expiry, monitor suppliers, and recommend hospital-to-hospital inventory transfers.



The application is a hackathon prototype for the theme:



"Track 3 — Smart Health & Supply Chain Resilience"



CORE PROBLEM:



Hospitals may experience medicine shortages because of unpredictable demand, poor inventory visibility, delayed supplier deliveries, emergency situations, and inefficient distribution between hospitals.



The application should use AI/ML-style forecasting and a risk engine to predict future demand and identify potential stock-outs before they happen.



IMPORTANT:



This is a healthcare logistics and inventory management application, NOT a medical diagnosis system. Do not provide medical diagnosis or treatment recommendations.



TECH STACK:



Frontend:

React

TypeScript

Tailwind CSS

shadcn/ui

Lucide icons

Recharts



Backend/data:

Use Supabase if available.

Create a clean database structure for hospitals, users, medicines, suppliers, demand history, predictions, alerts, and transfers.



AI:

Create a modular AI prediction service.

For the prototype, use realistic mock prediction data if a real ML backend is unavailable.

Structure the code so a Python FastAPI + Scikit-learn model can be connected later.



APPLICATION NAME:



MediResQ AI



TAGLINE:



"Predict shortages. Protect supplies. Strengthen healthcare."



DESIGN:



Create a premium modern healthcare dashboard.



Use:

white backgrounds

dark navy text

medical blue accents

green for safe

orange for warnings

red for critical alerts



Use rounded cards, subtle shadows, clean typography, responsive layouts, smooth animations, and professional charts.



SIDEBAR NAVIGATION:



Dashboard

Inventory

AI Predictions

Hospital Network

Transfers

Suppliers

Alerts

AI Assistant

Reports

Settings



1. LOGIN PAGE



Create a professional login screen.



Logo:

MediResQ AI



Fields:

Email

Password



Buttons:

Login

Demo Login



For demo mode, allow the user to enter the dashboard without requiring real authentication if Supabase authentication is not configured.



2. DASHBOARD



Create dashboard cards:



Total Medicines

Low Stock

Critical Stock

Predicted Shortages

Expiring Soon

Pending Transfers



Create charts:



Medicine Consumption Trend

AI Demand Forecast

Inventory Risk Distribution

Supplier Delivery Performance



Create a "Critical Alerts" section.



Example alert:



"Insulin shortage predicted in 4 days."



Create a "AI Recommendations" section.



Example:



"Transfer 100 units of Insulin from CityCare Hospital to Sunrise Hospital."



3. INVENTORY PAGE



Create a searchable and filterable inventory table.



Columns:



Medicine

Category

Batch Number

Hospital

Current Stock

Minimum Stock

Expiry Date

Daily Usage

Risk

Actions



Risk badges:



SAFE

LOW

MEDIUM

HIGH

CRITICAL



Add buttons:



Add Medicine

Edit

Delete

Transfer

Reorder



Create an Add Medicine modal.



Fields:



Medicine Name

Category

Batch Number

Quantity

Minimum Stock

Maximum Stock

Expiry Date

Supplier

Hospital



4. AI PREDICTION PAGE



Create a highly visual AI forecasting dashboard.



Allow the user to select a medicine.



Show:



Current Stock

Average Daily Usage

Predicted 7-Day Demand

Predicted 30-Day Demand

Shortage Probability

Risk Level

Recommended Order Quantity



Create an interactive Recharts graph showing historical demand and future predicted demand.



Example:



Medicine:

Insulin



Current stock:

150 units



Predicted 7-day demand:

190 units



Shortage:

40 units



Risk:

HIGH



Recommendation:

Order 100 units or transfer stock from another hospital.



Include a "Generate AI Prediction" button.



5. HOSPITAL NETWORK PAGE



Create a hospital network dashboard.



Show multiple hospitals:



CityCare Hospital

Sunrise Hospital

LifeLine Hospital

MediPlus Hospital



Each hospital should display inventory availability.



Allow the user to select a medicine and compare stock between hospitals.



Example:



CityCare Hospital

Insulin: 500 units

Status: Available



Sunrise Hospital

Insulin: 40 units

Status: Critical



LifeLine Hospital

Insulin: 280 units

Status: Available



Create an AI recommendation:



"Transfer 100 units from CityCare Hospital to Sunrise Hospital."



6. TRANSFERS PAGE



Create a hospital-to-hospital transfer management interface.



Fields:



From Hospital

To Hospital

Medicine

Quantity

Priority

Reason



Show transfer statuses:



Pending

Approved

In Transit

Completed



Use colored status badges.



7. SUPPLIERS PAGE



Create supplier management.



Columns:



Supplier

Medicine Categories

Average Delivery Time

Reliability

Current Orders

Status



Example suppliers:



MedSupply India

HealthCore

PharmaConnect



Create supplier details modal.



8. ALERTS PAGE



Create a centralized alert system.



Alert types:



Stock Shortage

Predicted Shortage

Expiry Warning

Demand Spike

Supplier Delay

Emergency



Severity:



Critical

High

Medium

Low



Allow filtering by severity.



Example:



CRITICAL:

"Insulin predicted to run out in 4 days."



HIGH:

"Amoxicillin demand increased significantly."



MEDIUM:

"250 units of medicine expire within 30 days."



9. AI ASSISTANT PAGE



Create a chatbot called:



"MediResQ Assistant"



The chatbot should answer questions using application data.



Example questions:



"Which medicines are at high shortage risk?"



"Which medicines expire soon?"



"Which hospital has excess insulin?"



"How much stock should we reorder?"



"Show critical alerts."



Use a clean chat interface.



If a real AI API is unavailable, implement intelligent demo responses based on the application's mock data.



10. EMERGENCY MODE



Create a special Emergency Mode button in the dashboard.



When activated, show:



EMERGENCY SUPPLY MODE



Demand Increase:

35%



Critical Medicines:

8



Hospitals Affected:

4



Available Emergency Stock:

72%



Create AI recommendations for emergency inventory redistribution.



Example:



"Move 100 units of Insulin from CityCare Hospital to Sunrise Hospital."



"Prioritize critical medicines."



"Increase supplier orders."



11. REPORTS PAGE



Create analytics reports.



Show:



Monthly medicine usage

Monthly shortages

Inventory wastage

Expiry losses

Supplier performance

Hospital transfers

AI prediction accuracy



Include charts and downloadable report buttons.



12. DATABASE



Create tables:



users

hospitals

medicines

suppliers

demand_history

predictions

alerts

transfers



Use proper relationships between tables.



13. SAMPLE DATA



Populate the application with realistic demo data.



Medicines:



Paracetamol

Insulin

Amoxicillin

Azithromycin

ORS

Salbutamol

Ceftriaxone

Metformin



Hospitals:



CityCare Hospital

Sunrise Hospital

LifeLine Hospital

MediPlus Hospital



Create at least 20 inventory records and 30 demand-history records so the charts look realistic.



14. AI RISK ENGINE



Create a frontend/demo AI risk engine using:



current stock

minimum stock

average daily usage

predicted demand

expiry days

demand growth

emergency multiplier



Calculate:



shortage risk

expiry risk

demand risk

overall risk



Return:



risk level

shortage probability

recommended order quantity

recommended action



Example output:



Risk: HIGH

Shortage Probability: 82%

Recommended Order: 100 units

Recommended Action: Transfer or reorder



15. RESPONSIVE DESIGN



The application must work perfectly on:



Desktop

Tablet

Mobile



Create a mobile bottom navigation or collapsible sidebar.



16. DEMO MODE



Add a clearly visible "Demo Mode" indicator.



The entire application must work with sample data without requiring external API keys.



17. UX



Add loading states.

Add empty states.

Add error messages.

Add confirmation dialogs for transfers and deletions.

Add toast notifications.



18. HACKATHON PRESENTATION



The dashboard should make the following story immediately visible:



Problem:

Medicine shortages and inefficient supply distribution.



AI:

Predict future medicine demand and shortage risk.



Action:

Recommend reorder or hospital-to-hospital transfer.



Impact:

Improve healthcare supply resilience and reduce emergency shortages.



19. IMPORTANT UI ELEMENT



Create a prominent dashboard card:



"AI Supply Chain Health"



Display:



Overall Resilience Score

87%



Predicted Shortages

8



Critical Medicines

5



Expiring Soon

12



Pending Transfers

6



20. FINAL QUALITY



Make the application look like a real startup product rather than a basic college project.



Use professional spacing, responsive design, polished cards, interactive charts, icons, animations, realistic data, and clear navigation.



The final product should be called:



MediResQ AI



Subtitle:



AI-Powered Healthcare Supply Chain Resilience Platform

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/28a65e95-0805-4537-8549-2d35766f59b5).

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
