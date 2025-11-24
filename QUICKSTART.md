# 🚀 Quick Start Guide

## Get Started in 3 Steps

### Step 1: Open Terminal/Command Prompt

**macOS/Linux:**
- Open Terminal application
- Navigate to the dashboard folder

**Windows:**
- Open Command Prompt or PowerShell
- Navigate to the dashboard folder

### Step 2: Install Dependencies (First Time Only)

**Option A - Automatic (Recommended):**

**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

**Option B - Manual:**

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Step 3: Open Browser

Navigate to: **http://localhost:5000**

---

## 📁 What You Get

```
executive-dashboard/
├── backend/              # Python Flask API
│   ├── app.py           # Main application
│   └── requirements.txt # Python dependencies
│
├── frontend/            # HTML/CSS/JavaScript
│   ├── index.html      # Main page
│   ├── styles.css      # Styling
│   └── app.js          # Interactive features
│
├── README.md           # Full documentation
├── QUICKSTART.md       # This file
├── start.sh            # Startup script (Mac/Linux)
└── start.bat           # Startup script (Windows)
```

---

## 🎯 First Time Usage

1. **Click "Get Started"** on the welcome screen

2. **Choose Your Data:**
   - **Option 1:** Select a sample dataset (Finance, Sales, Startup, Operations)
   - **Option 2:** Upload your own CSV file

3. **Explore the Dashboard:**
   - View KPI cards (Revenue, Profit, Customers, Costs)
   - Analyze trend charts
   - Try scenario modeling
   - Filter by department

---

## 📊 CSV Upload Format

Your CSV should have these columns:

**Required:**
- `date` (YYYY-MM-DD format)
- `revenue` (numeric)

**Optional:**
- `costs` (numeric)
- `customers` (numeric)
- `department` (text)

**Example:**
```csv
date,revenue,costs,customers,department
2024-01-01,500000,300000,1000,Sales
2024-02-01,520000,310000,1050,Marketing
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Dependencies Won't Install
```bash
# Upgrade pip first
pip install --upgrade pip

# Then install requirements
pip install -r requirements.txt
```

### Backend Starts But Frontend Doesn't Load
- Check that you're accessing http://localhost:5000 (not file://)
- Clear browser cache
- Try incognito/private mode

---

## 📖 Full Documentation

See **README.md** for:
- Complete API documentation
- Detailed feature explanations
- Architecture overview
- Advanced configuration
- Security considerations

---

## 💡 Key Features to Try

1. **📈 Forecasting**
   - Adjust forecast months (1-12)
   - See linear regression predictions

2. **⚡ Scenario Modeling**
   - Toggle scenario mode ON
   - Move slider to simulate revenue changes
   - See real-time impact calculations

3. **🔍 Department Analysis**
   - Use department filter dropdown
   - Compare performance across teams
   - View customer distribution

4. **📥 Export Data**
   - Download current data as CSV
   - Ready for further analysis

---

## 🎨 Sample Datasets Included

### 1. **Finance** - Financial Performance
- Steady growth pattern
- Balanced costs
- Good for P&L analysis

### 2. **Sales** - Sales Analytics  
- High revenue base
- Customer growth focus
- Multi-department view

### 3. **Startup** - Startup Growth
- Exponential growth
- High burn rate
- Scaling challenges

### 4. **Operations** - Operational Efficiency
- Efficiency metrics
- Cost optimization
- Resource allocation

---

## 🚀 Next Steps

After getting familiar with the dashboard:

1. **Upload Real Data**: Try your own business data
2. **Customize Alerts**: Adjust threshold in code
3. **Extend Analytics**: Add custom KPIs
4. **Integrate**: Connect to your databases
5. **Deploy**: Put it in production

---

## 📞 Need Help?

Check the main **README.md** for:
- Detailed troubleshooting
- API endpoint documentation
- Development guidelines
- Feature explanations

---

**Happy Analyzing! 📊✨**
