# Executive Business Performance Dashboard

A full-stack interactive business intelligence dashboard that enables executives to monitor real-time KPIs, analyze financial performance, forecast trends, and simulate business scenarios.

![Dashboard Preview](./docs/dashboard-preview.png)

## 🎯 Features

### Core Capabilities
- **Smart Data Processing**: Upload CSV files or use pre-built sample datasets
- **Automated ETL Pipeline**: Data validation, cleaning, and transformation
- **Real-time KPI Monitoring**: Track revenue, profit, customers, and costs
- **Predictive Analytics**: Linear regression-based revenue forecasting
- **Scenario Modeling**: Simulate "what-if" scenarios with adjustable parameters
- **Interactive Visualizations**: Dynamic charts powered by Chart.js
- **Department Analytics**: Multi-department performance comparison
- **Alert System**: Automatic detection of performance anomalies
- **Data Export**: Download reports in CSV format (PDF ready for integration)

### Technical Features
- RESTful API architecture
- SQLite database for data persistence
- Responsive design for desktop and mobile
- Modern ES6+ JavaScript
- Flask backend with pandas/scikit-learn analytics
- Clean separation of concerns (MVC pattern)

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│  (HTML/CSS/JS)  │
└────────┬────────┘
         │
         │ REST API
         │
┌────────▼────────┐
│   Flask API     │
│   (Python)      │
├─────────────────┤
│  Analytics      │
│  Engine         │
├─────────────────┤
│  SQLite DB      │
└─────────────────┘
```

## 📋 Prerequisites

- Python 3.8+
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Quick Start

### 1. Clone or Download

```bash
cd executive-dashboard
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### 3. Start the Backend Server

```bash
python app.py
```

The API server will start at `http://localhost:5000`

You should see:
```
🚀 Executive Dashboard API Server Starting...
📊 Access the dashboard at: http://localhost:5000
🔧 API Documentation: http://localhost:5000/api/health
```

### 4. Access the Dashboard

Open your browser and navigate to:
```
http://localhost:5000
```

The frontend is automatically served by Flask.

## 📊 Using the Dashboard

### Getting Started

1. **Welcome Screen**: Click "Get Started" to begin your journey
2. **Choose Data Source**: 
   - Use one of 4 sample datasets (Finance, Sales, Startup, Operations)
   - Or upload your own CSV file
3. **Processing**: Watch automated ETL pipeline validate and process data
4. **Dashboard**: Explore interactive KPIs, charts, and analytics

### Sample Datasets

#### 1. Financial Performance
- 12 months of revenue and cost data
- Multi-department breakdown
- Ideal for financial analysis

#### 2. Sales Analytics
- Sales performance metrics
- Customer growth tracking
- Department comparison

#### 3. Startup Growth
- Exponential growth patterns
- Burn rate analysis
- Scaling metrics

#### 4. Operational Efficiency
- Efficiency metrics
- Resource allocation
- Performance tracking

### Uploading Your Data

#### CSV Format Requirements

Your CSV file should include these columns (case-insensitive):

**Required:**
- `date` - Date in YYYY-MM-DD format
- `revenue` - Numeric revenue values

**Optional but Recommended:**
- `costs` - Numeric cost values
- `customers` - Number of customers
- `department` - Department name/category

#### Example CSV:

```csv
date,revenue,costs,customers,department
2024-01-01,500000,300000,1000,Sales
2024-02-01,520000,310000,1050,Sales
2024-03-01,545000,320000,1100,Marketing
```

### Dashboard Features

#### KPI Cards
- **Total Revenue**: Aggregate revenue with trend indicators
- **Total Profit**: Profit calculations with margin percentages
- **Average Customers**: Customer metrics with growth rates
- **Total Costs**: Cost analysis with revenue ratios

#### Revenue Trend & Forecast
- Historical revenue visualization
- Configurable forecast horizon (1-12 months)
- Linear regression predictions
- Area charts with gradient fills

#### Scenario Modeling
- Interactive slider (-50% to +50% adjustment)
- Real-time impact calculations
- Comparative visualization
- New revenue and profit projections

#### Department Analytics
- Revenue breakdown by department
- Customer distribution pie chart
- Comparative performance metrics

#### Alerts
- Automatic anomaly detection
- Revenue change alerts (>10% threshold)
- Low profit margin warnings
- High performance notifications

### Filters & Controls

- **Department Filter**: Focus on specific departments
- **Forecast Months**: Adjust prediction timeframe
- **Scenario Toggle**: Enable/disable scenario modeling
- **Export Options**: Download data as CSV or PDF

## 🔧 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### GET `/api/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-24T10:30:00",
  "version": "1.0.0"
}
```

#### GET `/api/sample-datasets`
Get list of available sample datasets

**Response:**
```json
[
  {
    "key": "finance",
    "name": "Financial Performance",
    "description": "12 months of revenue, costs, and profit data",
    "features": ["Revenue trends", "Cost analysis", ...]
  }
]
```

#### GET `/api/sample-data/<dataset_type>`
Load a specific sample dataset

**Parameters:**
- `dataset_type`: finance | sales | startup | operations

**Response:**
```json
{
  "success": true,
  "dataset_type": "finance",
  "record_count": 12,
  "data": [...],
  "kpis": {...},
  "forecast": [...],
  "departments": [...],
  "alerts": [...]
}
```

#### POST `/api/upload`
Upload and process CSV file

**Request:**
- Content-Type: multipart/form-data
- Body: file (CSV file)

**Response:**
```json
{
  "success": true,
  "message": "File uploaded and processed successfully",
  "warnings": [],
  "record_count": 50,
  "data": [...],
  "kpis": {...},
  "forecast": [...],
  "departments": [...],
  "alerts": [...]
}
```

#### POST `/api/analytics`
Get analytics for data with filters

**Request Body:**
```json
{
  "data": [...],
  "department": "Sales",
  "forecast_months": 3,
  "alert_threshold": 10
}
```

**Response:**
```json
{
  "success": true,
  "kpis": {
    "total_revenue": 1000000,
    "total_costs": 600000,
    "total_profit": 400000,
    "avg_customers": 5000,
    "profit_margin": 40.0,
    "revenue_change": 15.5,
    "customer_change": 10.2
  },
  "data": [...],
  "forecast": [...],
  "departments": [...],
  "alerts": [...]
}
```

#### POST `/api/forecast`
Generate revenue forecast

**Request Body:**
```json
{
  "months": 6
}
```

**Response:**
```json
{
  "success": true,
  "forecast": [
    {
      "date": "2025-01-01",
      "revenue": 550000,
      "forecast": 550000,
      "is_projection": true
    }
  ],
  "months": 6
}
```

#### POST `/api/scenario`
Run scenario modeling

**Request Body:**
```json
{
  "adjustment": 15
}
```

**Response:**
```json
{
  "success": true,
  "scenario": [...],
  "scenario_kpis": {
    "total_revenue": 1150000,
    "total_costs": 600000,
    "total_profit": 550000,
    "profit_margin": 47.8
  }
}
```

#### GET `/api/export/csv`
Export current data as CSV

**Response:**
- Content-Type: text/csv
- Body: CSV file download

## 🗂️ Project Structure

```
executive-dashboard/
├── backend/
│   ├── app.py                 # Flask application & API
│   ├── requirements.txt       # Python dependencies
│   ├── dashboard.db          # SQLite database (auto-created)
│   └── uploads/              # Upload directory (auto-created)
│
├── frontend/
│   ├── index.html            # Main HTML page
│   ├── styles.css            # CSS styles
│   └── app.js                # JavaScript application
│
├── README.md                 # This file
└── docs/                     # Documentation assets
```

## 🎨 Technology Stack

### Backend
- **Flask 3.0**: Web framework
- **Pandas 2.1**: Data manipulation and analysis
- **NumPy 1.26**: Numerical computing
- **Scikit-learn 1.3**: Machine learning (linear regression)
- **SQLite**: Embedded database
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients, animations
- **JavaScript ES6+**: Interactive functionality
- **Chart.js 4.4**: Data visualization
- **Font Awesome 6**: Icon library

## 🔍 Analytics Engine

### Data Processing Pipeline

1. **Validation**
   - Check required columns (date, revenue)
   - Validate data types
   - Detect missing values
   - Flag inconsistencies

2. **Cleaning**
   - Remove duplicates
   - Handle null values
   - Sort by date
   - Normalize formats

3. **Transformation**
   - Calculate profit (revenue - costs)
   - Compute profit margins
   - Aggregate by department
   - Generate time series

4. **Analysis**
   - Calculate KPIs
   - Identify trends
   - Detect anomalies
   - Generate alerts

### Forecasting Algorithm

Uses **Linear Regression** for revenue prediction:

```python
# Fit model to historical data
X = [0, 1, 2, ..., n]  # Time periods
y = [revenue_0, revenue_1, ..., revenue_n]

model = LinearRegression()
model.fit(X, y)

# Predict future periods
future_X = [n+1, n+2, ..., n+m]
predictions = model.predict(future_X)
```

### Scenario Modeling

Applies percentage adjustments to revenue:

```python
scenario_revenue = actual_revenue * (1 + adjustment/100)
scenario_profit = scenario_revenue - actual_costs
scenario_margin = (scenario_profit / scenario_revenue) * 100
```

## 🎯 Use Cases

### For CFOs & Finance Teams
- Monitor financial health in real-time
- Track revenue and profitability trends
- Forecast future performance
- Analyze cost structures

### For Operations Managers
- Compare department performance
- Identify efficiency opportunities
- Track operational metrics
- Optimize resource allocation

### For Business Analysts
- Perform what-if scenario analysis
- Generate executive reports
- Identify growth opportunities
- Detect performance anomalies

### For Executives & Leadership
- Get high-level performance overview
- Make data-driven decisions
- Track progress toward goals
- Communicate insights to stakeholders

## 🚀 Performance Optimization

### Backend
- Database indexing on date columns
- Query result caching
- Efficient pandas operations
- Asynchronous processing (future enhancement)

### Frontend
- Chart.js hardware acceleration
- Debounced filter updates
- Lazy loading for large datasets
- Optimized DOM updates

## 🔒 Security Considerations

### Current Implementation
- Input validation on file uploads
- SQL injection prevention (parameterized queries)
- CORS configuration
- File type restrictions

### Production Recommendations
- Add authentication (JWT tokens)
- Implement rate limiting
- Use HTTPS
- Add input sanitization
- Implement user roles/permissions
- Add audit logging

## 📈 Future Enhancements

### Analytics
- [ ] Advanced forecasting (ARIMA, Prophet)
- [ ] Anomaly detection (ML-based)
- [ ] Sentiment analysis
- [ ] Predictive maintenance
- [ ] Clustering analysis

### Features
- [ ] Real-time data streaming
- [ ] Custom dashboard builder
- [ ] Scheduled reports
- [ ] Email alerts
- [ ] Mobile app
- [ ] Multi-user support
- [ ] API authentication
- [ ] Advanced export (PDF, Excel)

### Integration
- [ ] Connect to databases (PostgreSQL, MySQL)
- [ ] API integrations (Salesforce, HubSpot)
- [ ] Cloud storage (S3, Google Drive)
- [ ] BI tools (Tableau, Power BI)

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.8+

# Install dependencies
pip install -r requirements.txt

# Check port availability
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows
```

### Frontend not loading
- Ensure backend is running on port 5000
- Check browser console for errors
- Clear browser cache
- Try incognito/private mode

### CSV upload fails
- Verify CSV has required columns (date, revenue)
- Check date format (YYYY-MM-DD)
- Ensure numeric values are valid
- Check file size (<10MB recommended)

### Charts not rendering
- Verify Chart.js loaded (check network tab)
- Check console for JavaScript errors
- Ensure data is properly formatted
- Try refreshing the page

## 📝 Contributing

This is a demonstration project. For production use:

1. Add comprehensive error handling
2. Implement authentication
3. Add unit tests
4. Set up CI/CD pipeline
5. Add monitoring and logging
6. Optimize database queries
7. Implement caching strategy

## 📄 License

This project is provided as-is for educational and demonstration purposes.

## 👤 Author

Created as an example of a full-stack business intelligence dashboard.

## 🙏 Acknowledgments

- Flask framework team
- Chart.js contributors
- Pandas and scikit-learn communities
- Font Awesome for icons

---

**Ready to transform your data into insights?** Start the server and open `http://localhost:5000` in your browser! 🚀
