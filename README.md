## 🚘 Automatic Number Plate Detection and Database Updation using IoT

This project is a full-stack web application that detects vehicle number plates from uploaded CCTV/recorded videos and stores them in a database. It combines React, Node.js, Python, and SQLite for a seamless solution.

---

## 💪 Tech Stack

- **Frontend**: React.js + Tailwind CSS (Dark/Light mode toggle)
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Number Plate Detection**: Python (OpenCV + EasyOCR)

---

## ✨ Features

- 🎥 Upload CCTV or recorded video for analysis
- 🔍 Detect number plates from video frames using Python
- 🧠 Auto-trigger Python script from backend
- 🗃️ Store results in SQLite database with timestamps
- 🌗 Modern UI with dark and light mode toggle

---

## 📁 Folder Structure

```
NumberPlateApp/
├── client/               # React frontend
│   └── src/
├── server/               # Express backend
│   ├── detect.py         # Python number plate detection
│   ├── database.js       # SQLite connection
│   ├── plates.db         # SQLite database file
│   ├── uploads/          # Uploaded videos
│   └── index.js          # Main backend server
├── README.md
```

---

## 📦 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Manoj-Murari/NumberPlateApp.git
cd NumberPlateApp
```

### 2. Install Dependencies

#### Backend

```bash
cd server
npm install
```

Also make sure you have Python installed. Install required Python packages:

```bash
pip install opencv-python easyocr
```

#### Frontend

```bash
cd ../client
npm install
```

---

## ▶️ Running the Application

### Start the Backend

```bash
cd server
node index.js
```

This runs on `http://localhost:5000`

### Start the Frontend

```bash
cd ../client
npm start
```

This runs on `http://localhost:3000`

---


## 🧠 Future Improvements

- Add live CCTV stream support
- Dashboard for analytics
- Vehicle type detection (car/bike/truck)
- Alerts via Email/SMS (planned)

---

## 👨‍💼 Developed By

**Manoj Murari**  
📧 saimnj357@gmail.com  
🌐 [GitHub](https://github.com/Manoj-Murari)

---
