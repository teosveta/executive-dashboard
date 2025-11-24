"""
Executive Business Performance Dashboard - Backend API
Flask application with data processing, forecasting, and analytics
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import io
import json
from sklearn.linear_model import LinearRegression
from scipy import stats
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
DATABASE = 'dashboard.db'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database initialization
def init_db():
    """Initialize SQLite database with tables"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Main data table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS business_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            revenue REAL,
            costs REAL,
            customers INTEGER,
            department TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Metadata table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS datasets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT,
            record_count INTEGER,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

# Sample datasets generator
def generate_sample_data(dataset_type='finance'):
    """Generate realistic sample business data"""
    
    datasets = {
        'finance': {
            'name': 'Financial Performance',
            'base_revenue': 500000,
            'revenue_variance': 200000,
            'growth_rate': 30000,
            'cost_ratio': 0.6
        },
        'sales': {
            'name': 'Sales Analytics',
            'base_revenue': 800000,
            'revenue_variance': 300000,
            'growth_rate': 40000,
            'cost_ratio': 0.5
        },
        'startup': {
            'name': 'Startup Growth',
            'base_revenue': 50000,
            'revenue_variance': 20000,
            'growth_rate': 1.25,
            'cost_ratio': 0.8
        },
        'operations': {
            'name': 'Operational Efficiency',
            'base_revenue': 600000,
            'revenue_variance': 150000,
            'growth_rate': 25000,
            'cost_ratio': 0.75
        }
    }
    
    config = datasets.get(dataset_type, datasets['finance'])
    data = []
    departments = ['Sales', 'Marketing', 'Engineering', 'Operations', 'Customer Success']
    
    for i in range(12):
        date = (datetime.now() - timedelta(days=365) + timedelta(days=30*i)).strftime('%Y-%m-%d')
        
        if dataset_type == 'startup':
            revenue = config['base_revenue'] * (config['growth_rate'] ** i) + np.random.normal(0, config['revenue_variance'])
        else:
            revenue = config['base_revenue'] + np.random.normal(0, config['revenue_variance']) + (i * config['growth_rate'])
        
        costs = revenue * config['cost_ratio'] + np.random.normal(0, 50000)
        customers = int(1000 + (i * 100) + np.random.normal(0, 50))
        department = departments[i % len(departments)]
        
        data.append({
            'date': date,
            'revenue': max(0, revenue),
            'costs': max(0, costs),
            'customers': max(0, customers),
            'department': department
        })
    
    return pd.DataFrame(data)

# Data validation and cleaning
class DataValidator:
    """Validate and clean uploaded data"""
    
    @staticmethod
    def validate_csv(df):
        """Validate CSV structure and content"""
        errors = []
        warnings = []
        
        # Check required columns
        required_cols = ['date', 'revenue']
        df_cols_lower = [col.lower() for col in df.columns]
        
        for req_col in required_cols:
            if req_col not in df_cols_lower:
                errors.append(f"Missing required column: {req_col}")
        
        if errors:
            return False, errors, warnings
        
        # Normalize column names
        df.columns = [col.lower().strip() for col in df.columns]
        
        # Validate data types
        try:
            df['date'] = pd.to_datetime(df['date'])
            df['revenue'] = pd.to_numeric(df['revenue'], errors='coerce')
            
            if 'costs' in df.columns:
                df['costs'] = pd.to_numeric(df['costs'], errors='coerce')
            else:
                df['costs'] = 0
            
            if 'customers' in df.columns:
                df['customers'] = pd.to_numeric(df['customers'], errors='coerce')
            else:
                df['customers'] = 0
                
        except Exception as e:
            errors.append(f"Data type conversion error: {str(e)}")
            return False, errors, warnings
        
        # Check for null values
        null_count = df['revenue'].isnull().sum()
        if null_count > 0:
            warnings.append(f"{null_count} rows with invalid revenue values will be removed")
            df = df.dropna(subset=['revenue'])
        
        # Check for negative values
        if (df['revenue'] < 0).any():
            warnings.append("Negative revenue values found and will be set to 0")
            df['revenue'] = df['revenue'].clip(lower=0)
        
        return True, errors, warnings, df
    
    @staticmethod
    def clean_data(df):
        """Clean and prepare data for analysis"""
        # Remove duplicates
        df = df.drop_duplicates(subset=['date'], keep='last')
        
        # Sort by date
        df = df.sort_values('date')
        
        # Fill missing values
        df = df.fillna(0)
        
        # Add calculated fields
        df['profit'] = df['revenue'] - df['costs']
        df['profit_margin'] = (df['profit'] / df['revenue'] * 100).fillna(0)
        
        return df

# Analytics Engine
class AnalyticsEngine:
    """Core analytics and forecasting engine"""
    
    @staticmethod
    def calculate_kpis(df):
        """Calculate key performance indicators"""
        total_revenue = df['revenue'].sum()
        total_costs = df['costs'].sum()
        total_profit = total_revenue - total_costs
        avg_customers = df['customers'].mean()
        profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0
        
        # Calculate trends (recent 3 months vs previous 3 months)
        if len(df) >= 6:
            recent = df.tail(3)
            previous = df.iloc[-6:-3]
            
            recent_revenue = recent['revenue'].mean()
            previous_revenue = previous['revenue'].mean()
            revenue_change = ((recent_revenue - previous_revenue) / previous_revenue * 100) if previous_revenue > 0 else 0
            
            recent_customers = recent['customers'].mean()
            previous_customers = previous['customers'].mean()
            customer_change = ((recent_customers - previous_customers) / previous_customers * 100) if previous_customers > 0 else 0
        else:
            revenue_change = 0
            customer_change = 0
        
        return {
            'total_revenue': float(total_revenue),
            'total_costs': float(total_costs),
            'total_profit': float(total_profit),
            'avg_customers': float(avg_customers),
            'profit_margin': float(profit_margin),
            'revenue_change': float(revenue_change),
            'customer_change': float(customer_change)
        }
    
    @staticmethod
    def forecast_revenue(df, months=3):
        """Forecast future revenue using linear regression"""
        if len(df) < 2:
            return []
        
        # Prepare data for regression
        df_sorted = df.sort_values('date').reset_index(drop=True)
        X = np.arange(len(df_sorted)).reshape(-1, 1)
        y = df_sorted['revenue'].values
        
        # Train model
        model = LinearRegression()
        model.fit(X, y)
        
        # Generate predictions
        last_idx = len(df_sorted)
        future_indices = np.arange(last_idx, last_idx + months).reshape(-1, 1)
        predictions = model.predict(future_indices)
        
        # Create forecast data
        last_date = df_sorted['date'].iloc[-1]
        forecast_data = []
        
        for i, pred in enumerate(predictions):
            forecast_date = last_date + timedelta(days=30 * (i + 1))
            forecast_data.append({
                'date': forecast_date.strftime('%Y-%m-%d'),
                'revenue': max(0, float(pred)),
                'forecast': max(0, float(pred)),
                'is_projection': True
            })
        
        return forecast_data
    
    @staticmethod
    def department_analysis(df):
        """Analyze performance by department"""
        if 'department' not in df.columns:
            return []
        
        dept_groups = df.groupby('department').agg({
            'revenue': 'sum',
            'costs': 'sum',
            'customers': 'sum'
        }).reset_index()
        
        dept_groups['profit'] = dept_groups['revenue'] - dept_groups['costs']
        
        return dept_groups.to_dict('records')
    
    @staticmethod
    def detect_alerts(kpis, threshold=10):
        """Detect performance alerts"""
        alerts = []
        
        # Revenue change alert
        if abs(kpis['revenue_change']) > threshold:
            alert_type = 'success' if kpis['revenue_change'] > 0 else 'warning'
            alerts.append({
                'type': alert_type,
                'message': f"Revenue {'increased' if kpis['revenue_change'] > 0 else 'decreased'} by {abs(kpis['revenue_change']):.1f}%",
                'severity': 'high' if abs(kpis['revenue_change']) > 20 else 'medium'
            })
        
        # Profit margin alert
        if kpis['profit_margin'] < 10:
            alerts.append({
                'type': 'warning',
                'message': f"Low profit margin: {kpis['profit_margin']:.1f}%",
                'severity': 'high'
            })
        
        # High profitability alert
        if kpis['profit_margin'] > 30:
            alerts.append({
                'type': 'success',
                'message': f"Strong profit margin: {kpis['profit_margin']:.1f}%",
                'severity': 'low'
            })
        
        return alerts
    
    @staticmethod
    def scenario_modeling(df, adjustment_percent):
        """Model scenario with adjusted revenue"""
        df_scenario = df.copy()
        df_scenario['scenario_revenue'] = df_scenario['revenue'] * (1 + adjustment_percent / 100)
        df_scenario['scenario_profit'] = df_scenario['scenario_revenue'] - df_scenario['costs']
        df_scenario['scenario_margin'] = (df_scenario['scenario_profit'] / df_scenario['scenario_revenue'] * 100).fillna(0)
        
        return df_scenario.to_dict('records')

# API Routes

@app.route('/')
def index():
    """Serve the main dashboard page"""
    return send_from_directory('../frontend', 'index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/sample-datasets', methods=['GET'])
def get_sample_datasets():
    """Get list of available sample datasets"""
    datasets = [
        {
            'key': 'finance',
            'name': 'Financial Performance',
            'description': '12 months of revenue, costs, and profit data',
            'features': ['Revenue trends', 'Cost analysis', 'Profit margins', 'Multi-department']
        },
        {
            'key': 'sales',
            'name': 'Sales Analytics',
            'description': 'Multi-department sales and customer metrics',
            'features': ['Sales performance', 'Customer growth', 'Department comparison', 'Trend analysis']
        },
        {
            'key': 'startup',
            'name': 'Startup Growth',
            'description': 'High-growth startup metrics with scaling challenges',
            'features': ['Exponential growth', 'Burn rate', 'Customer acquisition', 'Scaling metrics']
        },
        {
            'key': 'operations',
            'name': 'Operational Efficiency',
            'description': 'Operations and productivity metrics',
            'features': ['Efficiency metrics', 'Cost optimization', 'Resource allocation', 'Performance tracking']
        }
    ]
    return jsonify(datasets)

@app.route('/api/sample-data/<dataset_type>', methods=['GET'])
def load_sample_data(dataset_type):
    """Load sample dataset"""
    try:
        df = generate_sample_data(dataset_type)
        
        # Store in database
        conn = sqlite3.connect(DATABASE)
        df.to_sql('business_data', conn, if_exists='replace', index=False)
        conn.close()
        
        # Perform analysis
        df_clean = DataValidator.clean_data(df)
        kpis = AnalyticsEngine.calculate_kpis(df_clean)
        forecast = AnalyticsEngine.forecast_revenue(df_clean)
        departments = AnalyticsEngine.department_analysis(df_clean)
        alerts = AnalyticsEngine.detect_alerts(kpis)
        
        return jsonify({
            'success': True,
            'dataset_type': dataset_type,
            'record_count': len(df),
            'data': df.to_dict('records'),
            'kpis': kpis,
            'forecast': forecast,
            'departments': departments,
            'alerts': alerts
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/upload', methods=['POST'])
def upload_csv():
    """Upload and process CSV file"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'success': False, 'error': 'File must be CSV format'}), 400
    
    try:
        # Read CSV
        content = file.read().decode('utf-8')
        df = pd.read_csv(io.StringIO(content))
        
        # Validate
        valid, errors, warnings, df_clean = DataValidator.validate_csv(df)
        
        if not valid:
            return jsonify({
                'success': False,
                'errors': errors,
                'warnings': warnings
            }), 400
        
        # Clean data
        df_processed = DataValidator.clean_data(df_clean)
        
        # Store in database
        conn = sqlite3.connect(DATABASE)
        df_processed.to_sql('business_data', conn, if_exists='replace', index=False)
        conn.close()
        
        # Perform analysis
        kpis = AnalyticsEngine.calculate_kpis(df_processed)
        forecast = AnalyticsEngine.forecast_revenue(df_processed)
        departments = AnalyticsEngine.department_analysis(df_processed)
        alerts = AnalyticsEngine.detect_alerts(kpis)
        
        return jsonify({
            'success': True,
            'message': 'File uploaded and processed successfully',
            'warnings': warnings,
            'record_count': len(df_processed),
            'data': df_processed.to_dict('records'),
            'kpis': kpis,
            'forecast': forecast,
            'departments': departments,
            'alerts': alerts
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Processing error: {str(e)}'
        }), 500

@app.route('/api/analytics', methods=['POST'])
def get_analytics():
    """Get analytics for provided or stored data"""
    try:
        data = request.get_json()
        
        if 'data' in data:
            # Use provided data
            df = pd.DataFrame(data['data'])
        else:
            # Load from database
            conn = sqlite3.connect(DATABASE)
            df = pd.read_sql_query("SELECT * FROM business_data", conn)
            conn.close()
        
        if df.empty:
            return jsonify({'success': False, 'error': 'No data available'}), 400
        
        # Apply filters
        if 'department' in data and data['department'] != 'all':
            df = df[df['department'] == data['department']]
        
        df['date'] = pd.to_datetime(df['date'])
        df_clean = DataValidator.clean_data(df)
        
        # Calculate analytics
        kpis = AnalyticsEngine.calculate_kpis(df_clean)
        forecast_months = data.get('forecast_months', 3)
        forecast = AnalyticsEngine.forecast_revenue(df_clean, forecast_months)
        departments = AnalyticsEngine.department_analysis(df_clean)
        alert_threshold = data.get('alert_threshold', 10)
        alerts = AnalyticsEngine.detect_alerts(kpis, alert_threshold)
        
        # Scenario modeling if requested
        scenario_data = None
        if 'scenario_adjustment' in data:
            scenario_data = AnalyticsEngine.scenario_modeling(
                df_clean, 
                data['scenario_adjustment']
            )
        
        return jsonify({
            'success': True,
            'kpis': kpis,
            'data': df_clean.to_dict('records'),
            'forecast': forecast,
            'departments': departments,
            'alerts': alerts,
            'scenario': scenario_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/forecast', methods=['POST'])
def generate_forecast():
    """Generate revenue forecast"""
    try:
        data = request.get_json()
        months = data.get('months', 3)
        
        # Load data
        conn = sqlite3.connect(DATABASE)
        df = pd.read_sql_query("SELECT * FROM business_data", conn)
        conn.close()
        
        if df.empty:
            return jsonify({'success': False, 'error': 'No data available'}), 400
        
        df['date'] = pd.to_datetime(df['date'])
        forecast = AnalyticsEngine.forecast_revenue(df, months)
        
        return jsonify({
            'success': True,
            'forecast': forecast,
            'months': months
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/scenario', methods=['POST'])
def run_scenario():
    """Run scenario modeling"""
    try:
        data = request.get_json()
        adjustment = data.get('adjustment', 0)
        
        # Load data
        conn = sqlite3.connect(DATABASE)
        df = pd.read_sql_query("SELECT * FROM business_data", conn)
        conn.close()
        
        if df.empty:
            return jsonify({'success': False, 'error': 'No data available'}), 400
        
        df['date'] = pd.to_datetime(df['date'])
        scenario_data = AnalyticsEngine.scenario_modeling(df, adjustment)
        
        # Calculate scenario KPIs
        total_revenue = sum(d['scenario_revenue'] for d in scenario_data)
        total_costs = sum(d['costs'] for d in scenario_data)
        total_profit = total_revenue - total_costs
        
        return jsonify({
            'success': True,
            'scenario': scenario_data,
            'scenario_kpis': {
                'total_revenue': total_revenue,
                'total_costs': total_costs,
                'total_profit': total_profit,
                'profit_margin': (total_profit / total_revenue * 100) if total_revenue > 0 else 0
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    """Export current data as CSV"""
    try:
        conn = sqlite3.connect(DATABASE)
        df = pd.read_sql_query("SELECT * FROM business_data", conn)
        conn.close()
        
        if df.empty:
            return jsonify({'success': False, 'error': 'No data available'}), 400
        
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        return output.getvalue(), 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=dashboard_export.csv'
        }
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Executive Dashboard API Server Starting...")
    print("📊 Access the dashboard at: http://localhost:5000")
    print("🔧 API Documentation: http://localhost:5000/api/health")
    app.run(debug=True, host='0.0.0.0', port=5000)
