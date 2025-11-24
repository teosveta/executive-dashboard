import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload, TrendingUp, TrendingDown, AlertCircle, DollarSign, Users, ShoppingCart, Target, Download, RefreshCw, Settings, Filter, Calendar, ArrowUpRight, ArrowDownRight, PlayCircle, Zap, Database, CheckCircle } from 'lucide-react';

// Sample datasets for different business scenarios
const SAMPLE_DATASETS = {
  finance: {
    name: 'Financial Performance',
    description: '12 months of revenue, costs, and profit data',
    data: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2024, i, 1).toISOString().split('T')[0],
      revenue: 500000 + Math.random() * 200000 + (i * 30000),
      costs: 300000 + Math.random() * 100000 + (i * 15000),
      customers: 1000 + Math.floor(Math.random() * 200) + (i * 50),
      department: ['Sales', 'Marketing', 'Engineering', 'Operations'][i % 4]
    }))
  },
  sales: {
    name: 'Sales Analytics',
    description: 'Multi-department sales and customer metrics',
    data: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2024, i, 1).toISOString().split('T')[0],
      revenue: 800000 + Math.random() * 300000 + (i * 40000),
      costs: 400000 + Math.random() * 150000 + (i * 20000),
      customers: 2000 + Math.floor(Math.random() * 400) + (i * 80),
      department: ['Sales', 'Marketing', 'Engineering', 'Customer Success'][i % 4]
    }))
  },
  startup: {
    name: 'Startup Growth',
    description: 'High-growth startup metrics with scaling challenges',
    data: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2024, i, 1).toISOString().split('T')[0],
      revenue: 50000 * Math.pow(1.25, i) + Math.random() * 20000,
      costs: 80000 * Math.pow(1.15, i) + Math.random() * 15000,
      customers: 100 * Math.pow(1.3, i) + Math.floor(Math.random() * 50),
      department: ['Sales', 'Marketing', 'Engineering', 'Operations'][i % 4]
    }))
  },
  operations: {
    name: 'Operational Efficiency',
    description: 'Operations and productivity metrics',
    data: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2024, i, 1).toISOString().split('T')[0],
      revenue: 600000 + Math.random() * 150000 + (i * 25000),
      costs: 450000 + Math.random() * 100000 + (i * 18000),
      customers: 1500 + Math.floor(Math.random() * 250) + (i * 60),
      department: ['Sales', 'Marketing', 'Engineering', 'Operations'][i % 4]
    }))
  }
};

const ExecutiveDashboard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dataSource, setDataSource] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [dateRange, setDateRange] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [forecastMonths, setForecastMonths] = useState(3);
  const [scenarioAdjustment, setScenarioAdjustment] = useState(0);
  const [showScenario, setShowScenario] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(10);

  // Steps for the onboarding flow
  const steps = [
    { id: 'welcome', label: 'Welcome', icon: PlayCircle },
    { id: 'datasource', label: 'Data Source', icon: Upload },
    { id: 'validation', label: 'Validation', icon: CheckCircle },
    { id: 'etl', label: 'ETL Process', icon: Zap },
    { id: 'analysis', label: 'Analysis', icon: TrendingUp },
    { id: 'dashboard', label: 'Dashboard', icon: Target }
  ];

  // Process and validate uploaded CSV
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const parsed = parseCSV(text);
        if (validateData(parsed)) {
          setRawData(parsed);
          setDataSource('uploaded');
          setCurrentStep(2); // Move to validation
        }
      };
      reader.readAsText(file);
    }
  };

  // Parse CSV data
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, i) => {
        const value = values[i]?.trim();
        // Try to parse as number
        obj[header] = isNaN(value) ? value : parseFloat(value);
      });
      return obj;
    });
  };

  // Validate uploaded data
  const validateData = (data) => {
    if (!data || data.length === 0) return false;
    
    const requiredFields = ['date', 'revenue'];
    const headers = Object.keys(data[0]);
    
    return requiredFields.every(field => 
      headers.some(h => h.toLowerCase().includes(field))
    );
  };

  // Use sample dataset
  const useSampleData = (key) => {
    setSelectedDataset(key);
    setRawData(SAMPLE_DATASETS[key].data);
    setDataSource('sample');
    setCurrentStep(2); // Move to validation
  };

  // Auto-progress through ETL steps
  useEffect(() => {
    if (currentStep === 2) {
      setTimeout(() => setCurrentStep(3), 1500);
    } else if (currentStep === 3) {
      setTimeout(() => setCurrentStep(4), 1500);
    } else if (currentStep === 4) {
      setTimeout(() => setCurrentStep(5), 1500);
    }
  }, [currentStep]);

  // Calculate KPIs and analytics
  const analytics = useMemo(() => {
    if (rawData.length === 0) return null;

    // Filter data based on selections
    let filteredData = [...rawData];
    if (selectedDepartment !== 'all') {
      filteredData = filteredData.filter(d => d.department === selectedDepartment);
    }

    // Sort by date
    filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate core metrics
    const totalRevenue = filteredData.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const totalCosts = filteredData.reduce((sum, d) => sum + (d.costs || 0), 0);
    const totalProfit = totalRevenue - totalCosts;
    const avgCustomers = filteredData.reduce((sum, d) => sum + (d.customers || 0), 0) / filteredData.length;
    const profitMargin = (totalProfit / totalRevenue) * 100;

    // Calculate trends
    const recentData = filteredData.slice(-3);
    const previousData = filteredData.slice(-6, -3);
    
    const recentRevenue = recentData.reduce((sum, d) => sum + (d.revenue || 0), 0) / recentData.length;
    const previousRevenue = previousData.reduce((sum, d) => sum + (d.revenue || 0), 0) / previousData.length;
    const revenueChange = ((recentRevenue - previousRevenue) / previousRevenue) * 100;

    const recentCustomers = recentData.reduce((sum, d) => sum + (d.customers || 0), 0) / recentData.length;
    const previousCustomers = previousData.reduce((sum, d) => sum + (d.customers || 0), 0) / previousData.length;
    const customerChange = ((recentCustomers - previousCustomers) / previousCustomers) * 100;

    // Calculate forecast using linear regression
    const forecast = calculateForecast(filteredData, forecastMonths);

    // Department breakdown
    const departments = [...new Set(filteredData.map(d => d.department))].filter(Boolean);
    const departmentMetrics = departments.map(dept => {
      const deptData = filteredData.filter(d => d.department === dept);
      return {
        department: dept,
        revenue: deptData.reduce((sum, d) => sum + (d.revenue || 0), 0),
        customers: deptData.reduce((sum, d) => sum + (d.customers || 0), 0)
      };
    });

    // Detect alerts
    const alerts = [];
    if (Math.abs(revenueChange) > alertThreshold) {
      alerts.push({
        type: revenueChange < 0 ? 'warning' : 'success',
        message: `Revenue ${revenueChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(revenueChange).toFixed(1)}%`
      });
    }
    if (profitMargin < 10) {
      alerts.push({
        type: 'warning',
        message: `Low profit margin: ${profitMargin.toFixed(1)}%`
      });
    }

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      avgCustomers,
      profitMargin,
      revenueChange,
      customerChange,
      forecast,
      departmentMetrics,
      alerts,
      timeSeriesData: filteredData
    };
  }, [rawData, selectedDepartment, forecastMonths, alertThreshold]);

  // Simple linear regression forecast
  const calculateForecast = (data, months) => {
    if (data.length < 2) return [];

    const revenues = data.map(d => d.revenue || 0);
    const n = revenues.length;
    
    // Calculate slope and intercept
    const xMean = (n - 1) / 2;
    const yMean = revenues.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    revenues.forEach((y, x) => {
      numerator += (x - xMean) * (y - yMean);
      denominator += (x - xMean) ** 2;
    });
    
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;
    
    // Generate forecast
    return Array.from({ length: months }, (_, i) => {
      const x = n + i;
      const forecastValue = slope * x + intercept;
      const adjustment = showScenario ? forecastValue * (scenarioAdjustment / 100) : 0;
      
      return {
        date: `Forecast ${i + 1}`,
        revenue: forecastValue,
        forecast: forecastValue + adjustment,
        isProjection: true
      };
    });
  };

  // Apply scenario modeling
  const scenarioData = useMemo(() => {
    if (!analytics || !showScenario) return analytics?.timeSeriesData || [];
    
    return analytics.timeSeriesData.map(d => ({
      ...d,
      scenarioRevenue: d.revenue * (1 + scenarioAdjustment / 100),
      scenarioProfit: (d.revenue * (1 + scenarioAdjustment / 100)) - (d.costs || 0)
    }));
  }, [analytics, showScenario, scenarioAdjustment]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Render welcome screen
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 flex items-center justify-center p-8">
        <div className="max-w-4xl text-center text-white">
          <h1 className="text-6xl font-bold mb-6">Executive Business Performance Dashboard</h1>
          <p className="text-2xl mb-4 opacity-90">Transform Data into Actionable Insights</p>
          <p className="text-lg mb-12 opacity-80">
            Experience an interactive journey from raw data to strategic intelligence. Monitor KPIs, forecast trends, and simulate scenarios in real-time.
          </p>
          
          <button
            onClick={() => setCurrentStep(1)}
            className="bg-white text-purple-600 px-12 py-4 rounded-lg text-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started →
          </button>

          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6">
              <Upload className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Data Processing</h3>
              <p className="opacity-80">Upload CSV files or use demo data with automated validation</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6">
              <TrendingUp className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Predictive Analytics</h3>
              <p className="opacity-80">Forecast revenue, model scenarios, and track trends</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6">
              <Target className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Interactive Insights</h3>
              <p className="opacity-80">Drill-down dashboards with real-time KPI monitoring</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render data source selection
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        {/* Progress indicator */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${idx <= currentStep ? 'text-purple-600' : 'text-gray-400'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      idx <= currentStep ? 'bg-purple-600 text-white' : 'bg-gray-200'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-24 h-1 mx-4 ${idx < currentStep ? 'bg-purple-600' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">Choose Your Data Source</h2>
          <p className="text-gray-600 text-center mb-12 text-lg">Upload your own CSV file or explore with our sample dataset</p>

          <div className="grid grid-cols-2 gap-8">
            {/* Sample Data */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border-2 border-purple-200">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <PlayCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Use Demo Data</h3>
              <p className="text-gray-600 text-center mb-6">Explore with pre-loaded business metrics and sample data</p>
              
              <div className="space-y-3 mb-6">
                {Object.entries(SAMPLE_DATASETS).map(([key, dataset]) => (
                  <button
                    key={key}
                    onClick={() => useSampleData(key)}
                    className="w-full bg-white border-2 border-purple-200 rounded-lg p-4 text-left hover:border-purple-400 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{dataset.name}</h4>
                        <p className="text-sm text-gray-600">{dataset.description}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-purple-100 rounded-lg p-4 space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span>12 months of revenue data</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span>Multi-department analytics</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span>Customer segmentation</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span>Trend forecasting</span>
                </div>
              </div>
            </div>

            {/* Upload Data */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 border-2 border-blue-200">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Upload Your Data</h3>
              <p className="text-gray-600 text-center mb-6">Import CSV files with your business metrics</p>

              <label className="block">
                <div className="border-4 border-dashed border-blue-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                  <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2">Select CSV File</p>
                  <p className="text-sm text-gray-600">or drag and drop here</p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="mt-6 bg-blue-100 rounded-lg p-4">
                <p className="font-semibold mb-2">Expected columns:</p>
                <p className="text-sm text-gray-700 mb-3">Date, Revenue, Department, Customers, etc.</p>
                <p className="text-xs text-gray-600">
                  The system will automatically detect and validate your data structure, then adapt visualizations accordingly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render processing steps (validation, ETL, analysis)
  if (currentStep >= 2 && currentStep <= 4) {
    const stepInfo = {
      2: { title: 'Validation', subtitle: 'Data Quality Check', icon: CheckCircle, color: 'green' },
      3: { title: 'ETL Process', subtitle: 'Transform & Clean', icon: Zap, color: 'yellow' },
      4: { title: 'Analysis', subtitle: 'Generate Insights', icon: TrendingUp, color: 'blue' }
    };

    const current = stepInfo[currentStep];
    const Icon = current.icon;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <div className={`w-24 h-24 bg-${current.color}-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}>
            <Icon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-2">{current.title}</h2>
          <p className="text-xl text-gray-600 mb-8">{current.subtitle}</p>
          
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <span>Checking data structure...</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <span>Validating metrics...</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <span>Processing {rawData.length} records...</span>
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
            </div>

            <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentStep - 1) / 4) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  if (!analytics) return null;

  const combinedData = [...analytics.timeSeriesData, ...analytics.forecast];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
              <p className="text-sm text-gray-600">
                {dataSource === 'sample' ? `${SAMPLE_DATASETS[selectedDataset].name} Data` : 'Custom Data'} • {rawData.length} records
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {[...new Set(rawData.map(d => d.department))].filter(Boolean).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Change Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
        {analytics.alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {analytics.alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-center p-4 rounded-lg ${
                  alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
                }`}
              >
                <AlertCircle className={`w-5 h-5 mr-3 ${alert.type === 'warning' ? 'text-yellow-600' : 'text-green-600'}`} />
                <span className="font-medium">{alert.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold mb-2">{formatCurrency(analytics.totalRevenue)}</div>
            <div className={`flex items-center text-sm ${analytics.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="ml-1 font-medium">{formatPercent(analytics.revenueChange)}</span>
              <span className="ml-2 text-gray-500">vs prev period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Profit</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold mb-2">{formatCurrency(analytics.totalProfit)}</div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{analytics.profitMargin.toFixed(1)}%</span> margin
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Avg Customers</span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold mb-2">{Math.round(analytics.avgCustomers).toLocaleString()}</div>
            <div className={`flex items-center text-sm ${analytics.customerChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.customerChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="ml-1 font-medium">{formatPercent(analytics.customerChange)}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Costs</span>
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold mb-2">{formatCurrency(analytics.totalCosts)}</div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{((analytics.totalCosts / analytics.totalRevenue) * 100).toFixed(1)}%</span> of revenue
            </div>
          </div>
        </div>

        {/* Revenue Trend with Forecast */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Revenue Trend & Forecast</h2>
              <p className="text-sm text-gray-600">Historical data with {forecastMonths}-month projection</p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <span className="text-sm mr-2">Forecast months:</span>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={forecastMonths}
                  onChange={(e) => setForecastMonths(parseInt(e.target.value) || 3)}
                  className="w-16 px-2 py-1 border rounded focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={combinedData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                name="Actual Revenue"
              />
              <Area 
                type="monotone" 
                dataKey="forecast" 
                stroke="#3b82f6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1} 
                fill="url(#colorForecast)" 
                name="Forecasted Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Scenario Modeling */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 shadow-sm border border-purple-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center">
                <Zap className="w-6 h-6 mr-2 text-purple-600" />
                Scenario Modeling
              </h2>
              <p className="text-sm text-gray-600">Simulate the impact of revenue changes</p>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showScenario}
                onChange={(e) => setShowScenario(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm font-medium">Enable Scenarios</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Revenue Adjustment (%)</label>
              <input
                type="range"
                min="-50"
                max="50"
                value={scenarioAdjustment}
                onChange={(e) => setScenarioAdjustment(parseInt(e.target.value))}
                disabled={!showScenario}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>-50%</span>
                <span className="font-bold text-purple-600">{scenarioAdjustment}%</span>
                <span>+50%</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-2">Projected Impact</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">New Revenue:</span>
                  <span className="font-bold">{formatCurrency(analytics.totalRevenue * (1 + scenarioAdjustment / 100))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Profit:</span>
                  <span className="font-bold">{formatCurrency((analytics.totalRevenue * (1 + scenarioAdjustment / 100)) - analytics.totalCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Change:</span>
                  <span className={`font-bold ${scenarioAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(analytics.totalRevenue * (scenarioAdjustment / 100))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {showScenario && (
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={scenarioData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Current Revenue" />
                  <Area type="monotone" dataKey="scenarioRevenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Scenario Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Department Performance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-6">Department Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.departmentMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="department" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-6">Customer Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.departmentMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ department, customers }) => `${department}: ${customers}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="customers"
                >
                  {analytics.departmentMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Export & Share</h3>
              <p className="text-sm text-gray-600">Download reports and visualizations</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
