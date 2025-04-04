.no-alerts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  color: var(--success-color);
}

.inspection-details {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.inspection-details .details {
  display: flex;
  flex-direction: column;
}

.inspection-details .date {
  font-weight: 600;
  font-size: var(--font-size-lg);
}

.inspection-details .countdown {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.inspection-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.maintenance-item {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  background-color: var(--background-color);
  margin-bottom: var(--spacing-md);
}

.maintenance-date {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.maintenance-type {
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.maintenance-description {
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

/* Property Sensors Tab */
.property-sensors {
  margin-bottom: var(--spacing-xl);
}

.sensors-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.sensors-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.sensor-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.sensors-list {
  margin-top: var(--spacing-xl);
}

.sensors-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.sensor-status {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
}

.sensor-status.active {
  background-color: rgba(21, 128, 61, 0.1);
  color: var(--compliant);
}

.sensor-reading {
  font-weight: 600;
}

.sensor-reading.warning {
  color: var(--warning-color);
}

.battery-level {
  width: 50px;
  height: 10px;
  background-color: var(--border-color);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.battery-fill {
  height: 100%;
  background-color: var(--success-color);
}

/* Property Alerts Tab */
.property-alerts {
  margin-bottom: var(--spacing-xl);
}

.alerts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.alert-filters {
  display: flex;
  gap: var(--spacing-sm);
}

.alerts-detailed-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.alerts-detailed-list .alert-card {
  width: 100%;
}

.alert-body {
  padding: var(--spacing-md);
}

.alert-type {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.alert-location, .alert-detected, .alert-severity-label, .alert-deadline {
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.severity-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.severity-badge.high {
  background-color: rgba(190, 18, 60, 0.1);
  color: var(--high-risk);
}

.severity-badge.medium {
  background-color: rgba(202, 138, 4, 0.1);
  color: var(--at-risk);
}

.severity-badge.low {
  background-color: rgba(2, 132, 199, 0.1);
  color: var(--in-progress);
}

.deadline {
  font-weight: 600;
}

.no-alerts-container {
  display: flex;
  justify-content: center;
  margin: var(--spacing-xl) 0;
}

.no-alerts {
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-xl);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  // index.js - Main entry point for the application
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './styles/index.css';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// App.js - Main application component
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import PropertyDetail from './pages/PropertyDetail';
import APIChecker from "../client/src/pages/APIChecker";
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/api-checker" component={<APIChecker />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

// components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Building, AlertTriangle, FileText, Settings
} from 'react-feather';
import '../styles/Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>Awaab's Law</h2>
        <p>Compliance Monitor</p>
      </div>
      <nav className="nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/properties" className={({ isActive }) => isActive ? 'active' : ''}>
          <Building size={20} />
          <span>Properties</span>
        </NavLink>
        <NavLink to="/alerts" className={({ isActive }) => isActive ? 'active' : ''}>
          <AlertTriangle size={20} />
          <span>Alerts</span>
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
          <FileText size={20} />
          <span>Reports</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
      <div className="user-info">
        <div className="avatar">JD</div>
        <div className="user-details">
          <h4>John Doe</h4>
          <p>Housing Manager</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

// pages/Dashboard.js
import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { AlertTriangle, Check, Clock, ThermometerMinus } from 'react-feather';
import '../styles/Dashboard.css';

function Dashboard() {
  // Mock data for the charts
  const moistureReadings = [
    { month: 'Jan', avg: 55, threshold: 70 },
    { month: 'Feb', avg: 58, threshold: 70 },
    { month: 'Mar', avg: 62, threshold: 70 },
    { month: 'Apr', avg: 67, threshold: 70 },
    { month: 'May', avg: 72, threshold: 70 },
    { month: 'Jun', avg: 75, threshold: 70 },
    { month: 'Jul', avg: 71, threshold: 70 },
    { month: 'Aug', avg: 68, threshold: 70 },
    { month: 'Sep', avg: 65, threshold: 70 },
  ];

  const alertsData = [
    { name: 'High Priority', value: 14, color: '#FF6384' },
    { name: 'Medium Priority', value: 27, color: '#FFCE56' },
    { name: 'Low Priority', value: 41, color: '#36A2EB' },
    { name: 'Resolved', value: 162, color: '#4BC0C0' },
  ];

  const propertyComplianceData = [
    { name: 'Fully Compliant', value: 823, color: '#4BC0C0' },
    { name: 'Minor Issues', value: 142, color: '#FFCE56' },
    { name: 'Major Issues', value: 35, color: '#FF6384' },
  ];

  const responseTimeData = [
    { severity: 'Critical', avgTime: 7, target: 24 },
    { severity: 'High', avgTime: 38, target: 72 },
    { severity: 'Medium', avgTime: 94, target: 120 },
    { severity: 'Low', avgTime: 156, target: 168 },
  ];

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="dashboard-description">
        Overview of Housing Health & Safety compliance with Awaab's Law monitoring
      </p>

      <div className="stat-cards">
        <div className="stat-card high-risk">
          <div className="stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3>High Risk Properties</h3>
            <p className="stat-number">14</p>
            <p className="stat-description">Requiring immediate action</p>
          </div>
        </div>
        
        <div className="stat-card compliance">
          <div className="stat-icon">
            <Check size={24} />
          </div>
          <div className="stat-content">
            <h3>Compliance Rate</h3>
            <p className="stat-number">92%</p>
            <p className="stat-description">Properties meeting standards</p>
          </div>
        </div>
        
        <div className="stat-card response">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Avg. Response Time</h3>
            <p className="stat-number">18hrs</p>
            <p className="stat-description">For high priority issues</p>
          </div>
        </div>
        
        <div className="stat-card sensors">
          <div className="stat-icon">
            <ThermometerMinus size={24} />
          </div>
          <div className="stat-content">
            <h3>Active Sensors</h3>
            <p className="stat-number">4,287</p>
            <p className="stat-description">Monitoring in real-time</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-container moisture-levels">
          <h2>Average Moisture Levels</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moistureReadings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avg" 
                stroke="#36A2EB" 
                name="Average Reading" 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="threshold" 
                stroke="#FF6384" 
                name="Risk Threshold"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container active-alerts">
          <h2>Active Alerts</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={alertsData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => entry.name}
              >
                {alertsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container property-compliance">
          <h2>Property Compliance Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={propertyComplianceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => entry.name}
              >
                {propertyComplianceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container response-times">
          <h2>Response Times vs Targets (hours)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="severity" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgTime" name="Average Response Time" fill="#36A2EB" />
              <Bar dataKey="target" name="Target Response Time" fill="#FF6384" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-alerts">
        <h2>Recent Alerts</h2>
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Property</th>
              <th>Issue Type</th>
              <th>Severity</th>
              <th>Detected</th>
              <th>Status</th>
              <th>Response Deadline</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="high-priority">
              <td>AL-2024-1782</td>
              <td>15 Oakwood Heights</td>
              <td>Mould Growth</td>
              <td>High</td>
              <td>Today, 08:23</td>
              <td>New</td>
              <td>Within 24 hours</td>
              <td><button className="view-btn">View</button></td>
            </tr>
            <tr className="high-priority">
              <td>AL-2024-1781</td>
              <td>7B Riverside Flats</td>
              <td>Excessive Moisture</td>
              <td>High</td>
              <td>Today, 06:45</td>
              <td>Assigned</td>
              <td>Within 24 hours</td>
              <td><button className="view-btn">View</button></td>
            </tr>
            <tr className="medium-priority">
              <td>AL-2024-1780</td>
              <td>42 Birch Avenue</td>
              <td>Rising Moisture Levels</td>
              <td>Medium</td>
              <td>Yesterday, 16:12</td>
              <td>In Progress</td>
              <td>Within 3 days</td>
              <td><button className="view-btn">View</button></td>
            </tr>
            <tr className="medium-priority">
              <td>AL-2024-1779</td>
              <td>118 Elmwood Court</td>
              <td>Condensation Build-up</td>
              <td>Medium</td>
              <td>Yesterday, 12:30</td>
              <td>In Progress</td>
              <td>Within 3 days</td>
              <td><button className="view-btn">View</button></td>
            </tr>
            <tr className="low-priority">
              <td>AL-2024-1778</td>
              <td>23 Maple Drive</td>
              <td>Minor Dampness</td>
              <td>Low</td>
              <td>2 days ago</td>
              <td>Scheduled</td>
              <td>Within 7 days</td>
              <td><button className="view-btn">View</button></td>
            </tr>
          </tbody>
        </table>
        <div className="view-all-container">
          <button className="view-all-btn">View All Alerts</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

// pages/Alerts.js
import React, { useState } from 'react';
import { AlertCircle, Filter, Search } from 'react-feather';
import '../styles/Alerts.css';

function Alerts() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for alerts
  const alerts = [
    {
      id: 'AL-2024-1782',
      property: '15 Oakwood Heights',
      issueType: 'Mould Growth',
      severity: 'high',
      detected: 'Today, 08:23',
      status: 'new',
      responseDeadline: 'Within 24 hours',
      description: 'Significant black mould detected in bathroom ceiling and walls. Humidity sensors showing 85% consistently over the past 72 hours.',
      readings: { humidity: '85%', temperature: '18°C', co2: '1200ppm' }
    },
    {
      id: 'AL-2024-1781',
      property: '7B Riverside Flats',
      issueType: 'Excessive Moisture',
      severity: 'high',
      detected: 'Today, 06:45',
      status: 'assigned',
      responseDeadline: 'Within 24 hours',
      description: 'Multiple moisture sensors triggered in kitchen and adjacent bedroom. Potential leaking pipe in wall cavity.',
      readings: { humidity: '78%', temperature: '17°C', co2: '980ppm' }
    },
    {
      id: 'AL-2024-1780',
      property: '42 Birch Avenue',
      issueType: 'Rising Moisture Levels',
      severity: 'medium',
      detected: 'Yesterday, 16:12',
      status: 'in-progress',
      responseDeadline: 'Within 3 days',
      description: 'Gradual increase in moisture readings in living room over past week. Currently at upper warning threshold.',
      readings: { humidity: '72%', temperature: '19°C', co2: '850ppm' }
    },
    {
      id: 'AL-2024-1779',
      property: '118 Elmwood Court',
      issueType: 'Condensation Build-up',
      severity: 'medium',
      detected: 'Yesterday, 12:30',
      status: 'in-progress',
      responseDeadline: 'Within 3 days',
      description: 'Significant condensation on windows and external walls. Poor ventilation suspected.',
      readings: { humidity: '74%', temperature: '16°C', co2: '1050ppm' }
    },
    {
      id: 'AL-2024-1778',
      property: '23 Maple Drive',
      issueType: 'Minor Dampness',
      severity: 'low',
      detected: '2 days ago',
      status: 'scheduled',
      responseDeadline: 'Within 7 days',
      description: 'Small area of dampness detected near bathroom extractor. May indicate failing ventilation.',
      readings: { humidity: '67%', temperature: '20°C', co2: '820ppm' }
    },
    {
      id: 'AL-2024-1777',
      property: '56 Pine Gardens',
      issueType: 'Ventilation Issue',
      severity: 'low',
      detected: '3 days ago',
      status: 'scheduled',
      responseDeadline: 'Within 7 days',
      description: 'CO2 levels gradually rising above recommended levels. Ventilation system may need servicing.',
      readings: { humidity: '65%', temperature: '21°C', co2: '1100ppm' }
    },
    {
      id: 'AL-2024-1776',
      property: '9 Cedar Lane',
      issueType: 'Early Mould Indicator',
      severity: 'medium',
      detected: '3 days ago',
      status: 'resolved',
      responseDeadline: 'Within 3 days',
      description: 'VOC sensors detected early signs of mould growth in utility room. Tenant reported musty smell.',
      readings: { humidity: '70%', temperature: '18°C', co2: '900ppm' }
    },
    {
      id: 'AL-2024-1775',
      property: '31 Chestnut Road',
      issueType: 'Thermal Bridging',
      severity: 'low',
      detected: '4 days ago',
      status: 'resolved',
      responseDeadline: 'Within 7 days',
      description: 'Temperature differential on external wall indicating potential thermal bridging issue.',
      readings: { humidity: '64%', temperature: '17°C', co2: '780ppm' }
    },
  ];

  // Filter alerts based on status, severity, and search query
  const filteredAlerts = alerts.filter(alert => {
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesSearch = 
      alert.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      alert.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.issueType.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <h1>
          <AlertCircle size={24} />
          Alerts & Issues
        </h1>
        <p className="alerts-description">
          Monitor and respond to all detected issues within required timeframes
        </p>
      </div>

      <div className="alerts-filters">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search alerts by ID, property, or issue type..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Severity:</label>
            <select 
              value={severityFilter} 
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="alerts-summary">
        <div className="summary-card">
          <h3>High Priority</h3>
          <p className="summary-number">14</p>
        </div>
        <div className="summary-card">
          <h3>Medium Priority</h3>
          <p className="summary-number">27</p>
        </div>
        <div className="summary-card">
          <h3>Low Priority</h3>
          <p className="summary-number">41</p>
        </div>
        <div className="summary-card">
          <h3>Total Active</h3>
          <p className="summary-number">82</p>
        </div>
      </div>

      <div className="alerts-list">
        {filteredAlerts.map(alert => (
          <div key={alert.id} className={`alert-card ${alert.severity}`}>
            <div className="alert-header">
              <div className="alert-id">{alert.id}</div>
              <div className={`alert-status ${alert.status}`}>
                {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
              </div>
            </div>
            
            <div className="alert-property">{alert.property}</div>
            <div className="alert-issue">{alert.issueType}</div>
            
            <div className="alert-details">
              <div className="alert-info">
                <span className="label">Detected:</span> {alert.detected}
              </div>
              <div className="alert-info">
                <span className="label">Deadline:</span> {alert.responseDeadline}
              </div>
            </div>
            
            <div className="alert-description">
              {alert.description}
            </div>
            
            <div className="sensor-readings">
              <div className="reading">
                <span className="reading-label">Humidity</span>
                <span className="reading-value">{alert.readings.humidity}</span>
              </div>
              <div className="reading">
                <span className="reading-label">Temp</span>
                <span className="reading-value">{alert.readings.temperature}</span>
              </div>
              <div className="reading">
                <span className="reading-label">CO₂</span>
                <span className="reading-value">{alert.readings.co2}</span>
              </div>
            </div>
            
            <div className="alert-actions">
              <button className="action-btn view">View Details</button>
              {alert.status === 'new' && (
                <button className="action-btn assign">Assign</button>
              )}
              {alert.status === 'assigned' || alert.status === 'in-progress' ? (
                <button className="action-btn update">Update Status</button>
              ) : null}
              {alert.status === 'resolved' && (
                <button className="action-btn close">Close Alert</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alerts;

// pages/Properties.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, Search, MapPin, Filter, ChevronRight } from 'react-feather';
import '../styles/Properties.css';

function Properties() {
  const [searchQuery, setSearchQuery] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('all');
  const [propertyType, setPropertyType] = useState('all');

  // Mock data for properties
  const properties = [
    {
      id: 'P001',
      address: '15 Oakwood Heights',
      postcode: 'M15 4JB',
      type: 'Apartment',
      tenants: 3,
      bedrooms: 2,
      complianceStatus: 'high-risk',
      lastInspection: '2023-10-15',
      activeSensors: 8,
      activeAlerts: 2
    },
    {
      id: 'P002',
      address: '7B Riverside Flats',
      postcode: 'M3 5JQ',
      type: 'Apartment',
      tenants: 2,
      bedrooms: 1,
      complianceStatus: 'high-risk',
      lastInspection: '2023-11-02',
      activeSensors: 6,
      activeAlerts: 1
    },
    {
      id: 'P003',
      address: '42 Birch Avenue',
      postcode: 'M20 3RF',
      type: 'Semi-Detached',
      tenants: 4,
      bedrooms: 3,
      complianceStatus: 'at-risk',
      lastInspection: '2023-12-10',
      activeSensors: 12,
      activeAlerts: 1
    },
    {
      id: 'P004',
      address: '118 Elmwood Court',
      postcode: 'M14 7TD',
      type: 'Apartment',
      tenants: 3,
      bedrooms: 2,
      complianceStatus: 'at-risk',
      lastInspection: '2024-01-05',
      activeSensors: 7,
      activeAlerts: 1
    },
    {
      id: 'P005',
      address: '23 Maple Drive',
      postcode: 'M21 8PL',
      type: 'Terraced',
      tenants: 5,
      bedrooms: 3,
      complianceStatus: 'monitor',
      lastInspection: '2024-01-22',
      activeSensors: 10,
      activeAlerts: 1
    },
    {
      id: 'P006',
      address: '56 Pine Gardens',
      postcode: 'M16 9SK',
      type: 'Semi-Detached',
      tenants: 3,
      bedrooms: 2,
      complianceStatus: 'monitor',
      lastInspection: '2024-02-08',
      activeSensors: 9,
      activeAlerts: 1
    },
    {
      id: 'P007',
      address: '9 Cedar Lane',
      postcode: 'M4 6TY',
      type: 'Terraced',
      tenants: 2,
      bedrooms: 2,
      complianceStatus: 'compliant',
      lastInspection: '2024-02-17',
      activeSensors: 8,
      activeAlerts: 0
    },
    {
      id: 'P008',
      address: '31 Chestnut Road',
      postcode: 'M19 2WE',
      type: 'Detached',
      tenants: 6,
      bedrooms: 4,
      complianceStatus: 'compliant',
      lastInspection: '2024-03-01',
      activeSensors: 14,
      activeAlerts: 0
    },
  ];

  // Filter properties based on compliance status, property type, and search query
  const filteredProperties = properties.filter(property => {
    const matchesCompliance = complianceFilter === 'all' || property.complianceStatus === complianceFilter;
    const matchesType = propertyType === 'all' || property.type.toLowerCase() === propertyType.toLowerCase();
    const matchesSearch = 
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
      property.postcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCompliance && matchesType && matchesSearch;
  });

  return (
    <div className="properties-page">
      <div className="properties-header">
        <h1>
          <Building size={24} />
          Properties
        </h1>
        <p className="properties-description">
          Monitor and manage your property portfolio compliance status
        </p>
      </div>

      <div className="properties-filters">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search properties by address, postcode, or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Compliance Status:</label>
            <select 
              value={complianceFilter} 
              onChange={(e) => setComplianceFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="high-risk">High Risk</option>
              <option value="at-risk">At Risk</option>
              <option value="monitor">Monitor</option>
              <option value="compliant">Compliant</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Property Type:</label>
            <select 
              value={propertyType} 
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="terraced">Terraced</option>
              <option value="semi-detached">Semi-Detached</option>
              <option value="detached">Detached</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="properties-summary">
        <div className="summary-card high-risk">
          <h3>High Risk</h3>
          <p className="summary-number">14</p>
        </div>
        <div className="summary-card at-risk">
          <h3>At Risk</h3>
          <p className="summary-number">35</p>
        </div>
        <div className="summary-card monitor">
          <h3>Monitor</h3>
          <p className="summary-number">142</p>
        </div>
        <div className="summary-card compliant">
          <h3>Compliant</h3>
          <p className="summary-number">823</p>
        </div>
      </div>

      <div className="properties-list">
        {filteredProperties.map(property => (
          <Link to={`/properties/${property.id}`} key={property.id} className="property-card">
            <div className={`compliance-indicator ${property.complianceStatus}`}></div>
            <div className="property-header">
              <h3>{property.address}</h3>
              <span className="property-id">{property.id}</span>
            </div>
            
            <div className="property-location">
              <MapPin size={16} />
              <span>{property.postcode}</span>
            </div>
            
            <div className="property-details">
              <div className="property-detail">
                <span className="label">Type:</span>
                <span>{property.type}</span>
              </div>
              <div className="property-detail">
                <span className="label">Bedrooms:</span>
                <span>{property.bedrooms}</span>
              </div>
              <div className="property-detail">
                <span className="label">Tenants:</span>
                <span>{property.tenants}</span>
              </div>
            </div>
            
            <div className="property-compliance">
              <div className="compliance-label">
                {property.complianceStatus === 'high-risk' && 'High Risk'}
                {property.complianceStatus === 'at-risk' && 'At Risk'}
                {property.complianceStatus === 'monitor' && 'Monitor'}
                {property.complianceStatus === 'compliant' && 'Compliant'}
              </div>
              <div className="last-inspection">
                <span className="label">Last Inspection:</span>
                <span>{new Date(property.lastInspection).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="property-monitoring">
              <div className="monitoring-item">
                <span className="label">Active Sensors:</span>
                <span>{property.activeSensors}</span>
              </div>
              <div className="monitoring-item">
                <span className="label">Active Alerts:</span>
                <span className={property.activeAlerts > 0 ? 'has-alerts' : ''}>
                  {property.activeAlerts}
                </span>
              </div>
            </div>
            
            <div className="property-link">
              <span>View Details</span>
              <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Properties;

// pages/PropertyDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Building, MapPin, User, Calendar, AlertTriangle, 
  Thermometer, Droplet, Wind, Activity, 
  BarChart2, ArrowLeft, Clock, Tool
} from 'react-feather';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer
} from 'recharts';
import '../styles/PropertyDetail.css';

function PropertyDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock property data based on ID
  const property = {
    id: id,
    address: id === 'P001' ? '15 Oakwood Heights' : '42 Birch Avenue',
    postcode: id === 'P001' ? 'M15 4JB' : 'M20 3RF',
    type: id === 'P001' ? 'Apartment' : 'Semi-Detached',
    tenants: id === 'P001' ? 3 : 4,
    bedrooms: id === 'P001' ? 2 : 3,
    bathrooms: id === 'P001' ? 1 : 2,
    builtYear: id === 'P001' ? 1998 : 1965,
    complianceStatus: id === 'P001' ? 'high-risk' : 'at-risk',
    lastInspection: id === 'P001' ? '2023-10-15' : '2023-12-10',
    nextInspection: id === 'P001' ? '2024-04-15' : '2024-06-10',
    activeSensors: id === 'P001' ? 8 : 12,
    activeAlerts: id === 'P001' ? 2 : 1,
    epcRating: id === 'P001' ? 'D' : 'C',
    sensors: [
      { id: `${id}-S1`, type: 'Temperature', location: 'Living Room', status: 'active', lastReading: '21.5°C', batteryLevel: '85%' },
      { id: `${id}-S2`, type: 'Humidity', location: 'Living Room', status: 'active', lastReading: id === 'P001' ? '78%' : '65%', batteryLevel: '90%' },
      { id: `${id}-S3`, type: 'CO2', location: 'Living Room', status: 'active', lastReading: '850ppm', batteryLevel: '75%' },
      { id: `${id}-S4`, type: 'Temperature', location: 'Bedroom 1', status: 'active', lastReading: '19.8°C', batteryLevel: '95%' },
      { id: `${id}-S5`, type: 'Humidity', location: 'Bedroom 1', status: 'active', lastReading: id === 'P001' ? '72%' : '62%', batteryLevel: '92%' },
      { id: `${id}-S6`, type: 'Temperature', location: 'Bathroom', status: 'active', lastReading: '22.3°C', batteryLevel: '88%' },
      { id: `${id}-S7`, type: 'Humidity', location: 'Bathroom', status: 'active', lastReading: id === 'P001' ? '85%' : '68%', batteryLevel: '72%' },
      { id: `${id}-S8`, type: 'VOC', location: 'Bathroom', status: 'active', lastReading: id === 'P001' ? 'High' : 'Low', batteryLevel: '80%' },
    ]
  };

  // Mock data for sensor readings over time
  const humidityData = [
    { date: '2024-03-01', living: 65, bedroom: 60, bathroom: id === 'P001' ? 72 : 65, threshold: 70 },
    { date: '2024-03-02', living: 64, bedroom: 62, bathroom: id === 'P001' ? 74 : 66, threshold: 70 },
    { date: '2024-03-03', living: 66, bedroom: 63, bathroom: id === 'P001' ? 75 : 68, threshold: 70 },
    { date: '2024-03-04', living: 68, bedroom: 65, bathroom: id === 'P001' ? 76 : 67, threshold: 70 },
    { date: '2024-03-05', living: 70, bedroom: 68, bathroom: id === 'P001' ? 79 : 69, threshold: 70 },
    { date: '2024-03-06', living: 72, bedroom: 69, bathroom: id === 'P001' ? 82 : 70, threshold: 70 },
    { date: '2024-03-07', living: 74, bedroom: 70, bathroom: id === 'P001' ? 84 : 71, threshold: 70 },
    { date: '2024-03-08', living: 76, bedroom: 71, bathroom: id === 'P001' ? 85 : 70, threshold: 70 },
    { date: '2024-03-09', living: 78, bedroom: 72, bathroom: id === 'P001' ? 85 : 68, threshold: 70 },
  ];

  const temperatureData = [
    { date: '2024-03-01', living: 21.2, bedroom: 20.1, bathroom: 22.5, optimal: 21 },
    { date: '2024-03-02', living: 21.3, bedroom: 20.3, bathroom: 22.4, optimal: 21 },
    { date: '2024-03-03', living: 21.0, bedroom: 20.0, bathroom: 22.0, optimal: 21 },
    { date: '2024-03-04', living: 20.8, bedroom: 19.8, bathroom: 21.8, optimal: 21 },
    { date: '2024-03-05', living: 20.5, bedroom: 19.5, bathroom: 21.5, optimal: 21 },
    { date: '2024-03-06', living: 20.7, bedroom: 19.7, bathroom: 21.7, optimal: 21 },
    { date: '2024-03-07', living: 21.0, bedroom: 20.0, bathroom: 22.0, optimal: 21 },
    { date: '2024-03-08', living: 21.3, bedroom: 20.3, bathroom: 22.3, optimal: 21 },
    { date: '2024-03-09', living: 21.5, bedroom: 20.5, bathroom: 22.5, optimal: 21 },
  ];

  // Mock alerts for this property
  const propertyAlerts = [
    {
      id: `AL-2024-178${id === 'P001' ? '2' : '0'}`,
      issueType: id === 'P001' ? 'Mould Growth' : 'Rising Moisture Levels',
      severity: id === 'P001' ? 'high' : 'medium',
      location: id === 'P001' ? 'Bathroom' : 'Living Room',
      detected: id === 'P001' ? 'Today, 08:23' : 'Yesterday, 16:12',
      status: id === 'P001' ? 'new' : 'in-progress',
      description: id === 'P001' 
        ? 'Significant black mould detected in bathroom ceiling and walls. Humidity sensors showing 85% consistently over the past 72 hours.'
        : 'Gradual increase in moisture readings in living room over past week. Currently at upper warning threshold.'
    },
    id === 'P001' ? {
      id: 'AL-2024-1783',
      issueType: 'Condensation',
      severity: 'medium',
      location: 'Bedroom 1',
      detected: 'Yesterday, 19:45',
      status: 'assigned',
      description: 'Condensation forming on windows and external wall. Potential thermal bridging issue.'
    } : null
  ].filter(Boolean);

  // Mock inspection history
  const inspectionHistory = [
    {
      date: property.lastInspection,
      inspector: 'Sarah Johnson',
      findings: id === 'P001' 
        ? 'Evidence of condensation in bathroom. Extractor fan not working properly. Early signs of mould growth on ceiling corners.' 
        : 'Minor damp patch noted in living room corner. Tenant reported occasional condensation on windows.',
      recommendations: id === 'P001'
        ? 'Replace bathroom extractor fan. Check roof for potential leaks. Monitor humidity levels.'
        : 'Improve ventilation. Check external wall insulation. Monitor humidity levels.',
      complianceStatus: id === 'P001' ? 'at-risk' : 'monitor'
    },
    {
      date: '2023-04-15',
      inspector: 'Michael Brown',
      findings: 'No significant issues found. Property in good condition.',
      recommendations: 'Routine maintenance only.',
      complianceStatus: 'compliant'
    },
    {
      date: '2022-10-10',
      inspector: 'Emma Wilson',
      findings: 'Some minor issues with window seals causing draft. Heating system functioning well.',
      recommendations: 'Reseal windows. Check ventilation system.',
      complianceStatus: 'monitor'
    }
  ];

  // Mock maintenance history
  const maintenanceHistory = [
    {
      id: `MR-${id}-001`,
      date: id === 'P001' ? '2023-10-20' : '2023-12-15',
      type: id === 'P001' ? 'Ventilation Repair' : 'Insulation',
      description: id === 'P001' 
        ? 'Repaired and serviced bathroom extractor fan. Cleaned ventilation ducts.' 
        : 'Added additional insulation to loft space. Sealed gaps around windows.',
      technician: 'Robert Lewis',
      status: 'completed',
      followUp: id === 'P001' ? 'Required in 1 month' : 'None required'
    },
    {
      id: `MR-${id}-002`,
      date: '2023-06-12',
      type: 'Heating System',
      description: 'Annual servicing of gas central heating system. Replaced thermostat.',
      technician: 'David Green',
      status: 'completed',
      followUp: 'Annual service due June 2024'
    },
    {
      id: `MR-${id}-003`,
      date: '2023-02-28',
      type: 'Plumbing',
      description: 'Fixed leaking pipe under kitchen sink. Checked all other water connections.',
      technician: 'Sarah Johnson',
      status: 'completed',
      followUp: 'None required'
    }
  ];

  return (
    <div className="property-detail-page">
      <div className="back-link">
        <ArrowLeft size={16} />
        <span>Back to Properties</span>
      </div>

      <div className="property-header">
        <div className={`compliance-badge ${property.complianceStatus}`}>
          {property.complianceStatus === 'high-risk' && 'High Risk'}
          {property.complianceStatus === 'at-risk' && 'At Risk'}
          {property.complianceStatus === 'monitor' && 'Monitor'}
          {property.complianceStatus === 'compliant' && 'Compliant'}
        </div>
        <h1>{property.address}</h1>
        <div className="property-meta">
          <div className="meta-item">
            <MapPin size={16} />
            <span>{property.postcode}</span>
          </div>
          <div className="meta-item">
            <Building size={16} />
            <span>{property.type}</span>
          </div>
          <div className="meta-item">
            <User size={16} />
            <span>{property.tenants} tenants</span>
          </div>
          <div className="meta-item">
            <Calendar size={16} />
            <span>Built {property.builtYear}</span>
          </div>
        </div>
      </div>

      <div className="property-stats">
        <div className="stat-card">
          <h3>Active Alerts</h3>
          <p className={`stat-value ${property.activeAlerts > 0 ? 'warning' : ''}`}>
            {property.activeAlerts}
          </p>
        </div>
        <div className="stat-card">
          <h3>Sensors</h3>
          <p className="stat-value">{property.activeSensors}</p>
        </div>
        <div className="stat-card">
          <h3>Last Inspection</h3>
          <p className="stat-value">{new Date(property.lastInspection).toLocaleDateString()}</p>
        </div>
        <div className="stat-card">
          <h3>Next Due</h3>
          <p className="stat-value">{new Date(property.nextInspection).toLocaleDateString()}</p>
        </div>
        <div className="stat-card">
          <h3>EPC Rating</h3>
          <p className={`stat-value epc-${property.epcRating.toLowerCase()}`}>
            {property.epcRating}
          </p>
        </div>
      </div>

      <div className="property-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'sensors' ? 'active' : ''}
          onClick={() => setActiveTab('sensors')}
        >
          Sensors & Monitoring
        </button>
        <button 
          className={activeTab === 'alerts' ? 'active' : ''}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts
          {property.activeAlerts > 0 && <span className="alert-badge">{property.activeAlerts}</span>}
        </button>
        <button 
          className={activeTab === 'inspections' ? 'active' : ''}
          onClick={() => setActiveTab('inspections')}
        >
          Inspections
        </button>
        <button 
          className={activeTab === 'maintenance' ? 'active' : ''}
          onClick={() => setActiveTab('maintenance')}
        >
          Maintenance
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="property-overview tab-content">
          <div className="overview-grid">
            <div className="overview-card sensor-summary">
              <h3>Sensor Summary</h3>
              <div className="sensor-stats">
                <div className="sensor-stat">
                  <Thermometer size={20} />
                  <div className="stat-details">
                    <span className="stat-label">Temperature (avg)</span>
                    <span className="stat-value">21.2°C</span>
                  </div>
                </div>
                <div className="sensor-stat">
                  <Droplet size={20} />
                  <div className="stat-details">
                    <span className="stat-label">Humidity (avg)</span>
                    <span className={`stat-value ${id === 'P001' ? 'warning' : ''}`}>
                      {id === 'P001' ? '78%' : '65%'}
                    </span>
                  </div>
                </div>
                <div className="sensor-stat">
                  <Wind size={20} />
                  <div className="stat-details">
                    <span className="stat-label">CO2 Levels (avg)</span>
                    <span className="stat-value">850ppm</span>
                  </div>
                </div>
              </div>
              <button className="view-all-btn">View All Sensor Data</button>
            </div>

            <div className="overview-card alerts-summary">
              <h3>Active Alerts</h3>
              {property.activeAlerts > 0 ? (
                <div className="alerts-list-mini">
                  {propertyAlerts.map(alert => (
                    <div key={alert.id} className={`alert-item-mini ${alert.severity}`}>
                      <div className="alert-heading">
                        <span className="alert-id">{alert.id}</span>
                        <span className="alert-severity">{alert.severity}</span>
                      </div>
                      <p className="alert-type">{alert.issueType}</p>
                      <p className="alert-location">{alert.location}</p>
                      <p className="alert-detected">Detected: {alert.detected}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-alerts">
                  <Check size={24} />
                  <p>No active alerts for this property</p>
                </div>
              )}
              <button className="view-all-btn">View All Alerts</button>
            </div>

            <div className="overview-card humidity-chart">
              <h3>Humidity Trends (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={humidityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} />
                  <YAxis domain={[50, 90]} tick={{fontSize: 10}} />
                  <Tooltip />
                  <Legend wrapperStyle={{fontSize: 10}} />
                  <Line type="monotone" dataKey="living" name="Living Room" stroke="#8884d8" dot={false} />
                  <Line type="monotone" dataKey="bedroom" name="Bedroom" stroke="#82ca9d" dot={false} />
                  <Line type="monotone" dataKey="bathroom" name="Bathroom" stroke="#ff7300" dot={false} />
                  <Line type="monotone" dataKey="threshold" name="Risk Threshold" stroke="#ff0000" strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="overview-card temperature-chart">
              <h3>Temperature Trends (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} />
                  <YAxis domain={[15, 25]} tick={{fontSize: 10}} />
                  <Tooltip />
                  <Legend wrapperStyle={{fontSize: 10}} />
                  <Line type="monotone" dataKey="living" name="Living Room" stroke="#8884d8" dot={false} />
                  <Line type="monotone" dataKey="bedroom" name="Bedroom" stroke="#82ca9d" dot={false} />
                  <Line type="monotone" dataKey="bathroom" name="Bathroom" stroke="#ff7300" dot={false} />
                  <Line type="monotone" dataKey="optimal" name="Optimal" stroke="#0088fe" strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="overview-card next-inspection">
              <h3>Next Inspection</h3>
              <div className="inspection-details">
                <Calendar size={20} />
                <div className="details">
                  <p className="date">{new Date(property.nextInspection).toLocaleDateString()}</p>
                  <p className="countdown">
                    {Math.round((new Date(property.nextInspection) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
                  </p>
                </div>
              </div>
              <div className="inspection-actions">
                <button className="action-btn">Schedule Now</button>
                <button className="action-btn secondary">View Checklist</button>
              </div>
            </div>

            <div className="overview-card recent-maintenance">
              <h3>Recent Maintenance</h3>
              <div className="maintenance-item">
                <div className="maintenance-date">
                  {new Date(maintenanceHistory[0].date).toLocaleDateString()}
                </div>
                <div className="maintenance-details">
                  <p className="maintenance-type">{maintenanceHistory[0].type}</p>
                  <p className="maintenance-description">{maintenanceHistory[0].description}</p>
                </div>
              </div>
              <button className="view-all-btn">View Maintenance History</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sensors' && (
        <div className="property-sensors tab-content">
          <div className="sensors-header">
            <h3>Property Sensors</h3>
            <div className="sensors-actions">
              <button className="action-btn">
                <span className="btn-icon">+</span>
                Add New Sensor
              </button>
              <button className="action-btn secondary">
                <span className="btn-icon">↻</span>
                Refresh All
              </button>
            </div>
          </div>

          <div className="sensor-charts">
            <div className="chart-container humidity-detailed">
              <h3>Humidity Levels by Room (%)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={humidityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[50, 90]} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="living" name="Living Room" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="bedroom" name="Bedroom" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="bathroom" name="Bathroom" stroke="#ff7300" fill="#ff7300" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="threshold" name="Risk Threshold" stroke="#ff0000" fill="#ff0000" fillOpacity={0} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container temperature-detailed">
              <h3>Temperature by Room (°C)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[15, 25]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="living" name="Living Room" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="bedroom" name="Bedroom" stroke="#82ca9d" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="bathroom" name="Bathroom" stroke="#ff7300" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="optimal" name="Optimal" stroke="#0088fe" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="sensors-list">
            <table className="sensors-table">
              <thead>
                <tr>
                  <th>Sensor ID</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Last Reading</th>
                  <th>Battery</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {property.sensors.map(sensor => (
                  <tr key={sensor.id}>
                    <td>{sensor.id}</td>
                    <td>{sensor.type}</td>
                    <td>{sensor.location}</td>
                    <td className="sensor-status active">{sensor.status}</td>
                    <td className={`sensor-reading ${
                      sensor.type === 'Humidity' && 
                      parseFloat(sensor.lastReading) > 70 ? 'warning' : ''
                    }`}>
                      {sensor.lastReading}
                    </td>
                    <td>
                      <div className="battery-level">
                        <div 
                          className="battery-fill"
                          style={{ width: sensor.batteryLevel }}
                        ></div>
                      </div>
                      <span>{sensor.batteryLevel}</span>
                    </td>
                    <td>Today, 10:23</td>
                    <td>
                      <button className="small-btn">Details</button>
                      <button className="small-btn">Test</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="property-alerts tab-content">
          <div className="alerts-header">
            <h3>Property Alerts</h3>
            <div className="alert-filters">
              <select className="alert-filter">
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select className="alert-filter">
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {property.activeAlerts > 0 ? (
            <div className="alerts-detailed-list">
              {propertyAlerts.map(alert => (
                <div key={alert.id} className={`alert-card ${alert.severity}`}>
                  <div className="alert-header">
                    <div className="alert-id">{alert.id}</div>
                    <div className={`alert-status ${alert.status}`}>
                      {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="alert-body">
                    <div className="alert-type">{alert.issueType}</div>
                    <div className="alert-location">
                      <span className="label">Location:</span> {alert.location}
                    </div>
                    <div className="alert-detected">
                      <span className="label">Detected:</span> {alert.detected}
                    </div>
                    <div className="alert-severity-label">
                      <span className="label">Severity:</span> 
                      <span className={`severity-badge ${alert.severity}`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                    </div>
                    <div className="alert-deadline">
                      <span className="label">Response Required:</span> 
                      <span className="deadline">
                        Within {alert.severity === 'high' ? '24 hours' : 
                               alert.severity === 'medium' ? '3 days' : '7 days'}
                      </span>
                    </div>
                    <div className="alert-description">
                      {alert.description}
                    </div>
                  </div>

                  <div className="alert-actions">
                    {alert.status === 'new' && (
                      <>
                        <button className="action-btn assign">Assign Task</button>
                        <button className="action-btn inspect">Schedule Inspection</button>
                      </>
                    )}
                    {alert.status === 'assigned' && (
                      <>
                        <button className="action-btn update">Update Status</button>
                        <button className="action-btn message">Message Team</button>
                      </>
                    )}
                    {alert.status === 'in-progress' && (
                      <>
                        <button className="action-btn update">Update Status</button>
                        <button className="action-btn resolve">Mark Resolved</button>
                      </>
                    )}
                    <button className="action-btn secondary">View History</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-alerts-container">
              <div className="no-alerts">
                <Check size={48} />
                <h3>No Active Alerts</h3>
                <p>This property has no active alerts at the moment.</p>
              </div>
            </div>
          )}

          <div className="alerts-history">
            <h3>Alert History</h3>
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>Alert ID</th>
                  <th>Issue Type</th>
                  <th>Location</th>
                  <th>Detected</th>
                  <th>Resolved</th>
                  <th>Time to Resolve</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>AL-2024-1655</td>
                  <td>Condensation</td>
                  <td>Living Room</td>
                  <td>2024-02-15</td>
                  <td>2024-02-17</td>
                  <td>2 days</td>
                  <td><button className="small-btn">Details</button></td>
                </tr>
                <tr>
                  <td>AL-2024-1522</td>
                  <td>Minor Damp</td>
                  <td>Bedroom 2</td>
                  <td>2024-01-28</td>
                  <td>2024-01-30</td>
                  <td>2 days</td>
                  <td><button className="small-btn">Details</button></td>
                </tr>
                <tr>
                  <td>AL-2023-1498</td>
                  <td>Ventilation Issue</td>
                  <td>Bathroom</td>
                  <td>2023-12-10</td>
                  <td>2023-12-20</td>
                  <td>10 days</td>
                  <td><button className="small-btn">Details</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inspections' && (
        <div className="property-inspections tab-content">
          <div className="inspections-header">
            <h3>Inspection History</h3>
            <div className="inspection-actions">
              <button className="action-btn">
                <Calendar size={16} />
                Schedule Inspection
              </button>
              <button className="action-btn secondary">
                <Clock size={16} />
                View Inspection Timelines
              </button>
            </div>
          </div>

          <div className="next-inspection-card">
            <div className="card-header">
              <h3>Next Scheduled Inspection</h3>
              <div className="inspection-date">
                <Calendar size={20} />
                <span>{new Date(property.nextInspection).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="card-body">
              <div className="inspection-countdown">
                <Clock size={20} />
                <span>{Math.round((new Date(property.nextInspection) - new Date()) / (1000 * 60 * 60 * 24))} days remaining</span>
              </div>
              <div className="inspection-type">Regular Quarterly Inspection</div>
              <div className="inspector">
                <span className="label">Assigned Inspector:</span>
                <span>Sarah Johnson</span>
              </div>
            </div>
            <div className="card-actions">
              <button className="action-btn">View Checklist</button>
              <button className="action-btn secondary">Reschedule</button>
            </div>
          </div>

          <div className="inspection-timeline">
            {inspectionHistory.map((inspection, index) => (
              <div key={index} className="inspection-item">
                <div className="timeline-marker"></div>
                <div className="inspection-card">
                  <div className="inspection-card-header">
                    <div className="inspection-date">{new Date(inspection.date).toLocaleDateString()}</div>
                    <div className={`compliance-status ${inspection.complianceStatus}`}>
                      {inspection.complianceStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                  <div className="inspection-details">
                    <div className="inspector-info">
                      <span className="label">Inspector:</span>
                      <span>{inspection.inspector}</span>
                    </div>
                    <div className="findings">
                      <span className="label">Findings:</span>
                      <p>{inspection.findings}</p>
                    </div>
                    <div className="recommendations">
                      <span className="label">Recommendations:</span>
                      <p>{inspection.recommendations}</p>
                    </div>
                  </div>
                  <div className="inspection-actions">
                    <button className="small-btn">View Report</button>
                    <button className="small-btn">View Photos</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="inspection-stats">
            <h3>Inspection Statistics</h3>
            <div className="stats-cards">
              <div className="stat-card">
                <h4>Total Inspections</h4>
                <p className="stat-value">12</p>
                <p className="stat-sub">Since 2020</p>
              </div>
              <div className="stat-card">
                <h4>Compliance Rate</h4>
                <p className="stat-value">83%</p>
                <p className="stat-sub">Historical average</p>
              </div>
              <div className="stat-card">
                <h4>Time Between Inspections</h4>
                <p className="stat-value">102 days</p>
                <p className="stat-sub">Average</p>
              </div>
              <div className="stat-card">
                <h4>Issues Found</h4>
                <p className="stat-value">8</p>
                <p className="stat-sub">Total recorded</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="property-maintenance tab-content">
          <div className="maintenance-header">
            <h3>Maintenance History</h3>
            <div className="maintenance-actions">
              <button className="action-btn">
                <Tool size={16} />
                Schedule Maintenance
              </button>
              <button className="action-btn secondary">
                <BarChart2 size={16} />
                View Maintenance Stats
              </button>
            </div>
          </div>

          <div className="maintenance-summary">
            <div className="summary-card">
              <h4>Total Jobs</h4>
              <p className="summary-number">18</p>
              <p className="summary-sub">Since 2020</p>
            </div>
            <div className="summary-card">
              <h4>This Year</h4>
              <p className="summary-number">3</p>
              <p className="summary-sub">Jobs completed</p>
            </div>
            <div className="summary-card">
              <h4>Response Time</h4>
              <p className="summary-number">2.4 days</p>
              <p className="summary-sub">Average</p>
            </div>
            <div className="summary-card">
              <h4>Pending Jobs</h4>
              <p className="summary-number">1</p>
              <p className="summary-sub">Scheduled</p>
            </div>
          </div>

          <div className="maintenance-timeline">
            {maintenanceHistory.map((job) => (
              <div key={job.id} className="maintenance-item">
                <div className="maintenance-card">
                  <div className="maintenance-card-header">
                    <div className="maintenance-id">{job.id}</div>
                    <div className={`maintenance-status ${job.status}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </div>
                  </div>
                  <div className="maintenance-type">{job.type}</div>
                  <div className="maintenance-date">
                    <Calendar size={16} />
                    <span>{new Date(job.date).toLocaleDateString()}</span>
                  </div>
                  <div className="technician">
                    <span className="label">Technician:</span>
                    <span>{job.technician}</span>
                  </div>
                  <div className="maintenance-description">
                    <span className="label">Work Completed:</span>
                    <p>{job.description}</p>
                  </div>
                  <div className="follow-up">
                    <span className="label">Follow-up Required:</span>
                    <p>{job.followUp}</p>
                  </div>
                  <div className="maintenance-actions">
                    <button className="small-btn">View Details</button>
                    <button className="small-btn">View Photos</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyDetail;

// pages/Reports.js
import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, BarChart2, PieChart } from 'react-feather';
import '../styles/Reports.css';

function Reports() {
  const [reportType, setReportType] = useState('compliance');
  const [dateRange, setDateRange] = useState('month');

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>
          <FileText size={24} />
          Reports & Analytics
        </h1>
        <p className="reports-description">
          Generate and download regulatory compliance reports
        </p>
      </div>

      <div className="report-controls">
        <div className="control-group">
          <label>Report Type:</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="compliance">Compliance Overview</option>
            <option value="awaabs">Awaab's Law Compliance</option>
            <option value="sensors">Sensor Data Analysis</option>
            <option value="response">Response Time Analysis</option>
            <option value="properties">Property Risk Report</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>Date Range:</label>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        {dateRange === 'custom' && (
          <div className="date-inputs">
            <div className="date-input">
              <label>From:</label>
              <input type="date" />
            </div>
            <div className="date-input">
              <label>To:</label>
              <input type="date" />
            </div>
          </div>
        )}
        
        <button className="generate-btn">
          <BarChart2 size={16} />
          Generate Report
        </button>
      </div>

      <div className="saved-reports">
        <h2>Saved Reports</h2>
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Type</th>
              <th>Date Range</th>
              <th>Generated</th>
              <th>Generated By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Q1 2024 Compliance Summary</td>
              <td>Compliance Overview</td>
              <td>Jan 1, 2024 - Mar 31, 2024</td>
              <td>Apr 2, 2024</td>
              <td>John Doe</td>
              <td>
                <button className="small-btn">View</button>
                <button className="small-btn">
                  <Download size={14} />
                </button>
              </td>
            </tr>
            <tr>
              <td>Awaab's Law Compliance Report</td>
              <td>Awaab's Law Compliance</td>
              <td>Jan 1, 2024 - Mar 31, 2024</td>
              <td>Apr 1, 2024</td>
              <td>Jane Smith</td>
              <td>
                <button className="small-btn">View</button>
                <button className="small-btn">
                  <Download size={14} />
                </button>
              </td>
            </tr>
            <tr>
              <td>Response Time Analysis</td>
              <td>Response Time Analysis</td>
              <td>Mar 1, 2024 - Mar 31, 2024</td>
              <td>Apr 1, 2024</td>
              <td>John Doe</td>
              <td>
                <button className="small-btn">View</button>
                <button className="small-btn">
                  <Download size={14} />
                </button>
              </td>
            </tr>
            <tr>
              <td>High Risk Properties Report</td>
              <td>Property Risk Report</td>
              <td>Mar 15, 2024 - Mar 31, 2024</td>
              <td>Apr 1, 2024</td>
              <td>Jane Smith</td>
              <td>
                <button className="small-btn">View</button>
                <button className="small-btn">
                  <Download size={14} />
                </button>
              </td>
            </tr>
            <tr>
              <td>Monthly Moisture Readings</td>
              <td>Sensor Data Analysis</td>
              <td>Mar 1, 2024 - Mar 31, 2024</td>
              <td>Apr 1, 2024</td>
              <td>John Doe</td>
              <td>
                <button className="small-btn">View</button>
                <button className="small-btn">
                  <Download size={14} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="report-templates">
        <h2>Report Templates</h2>
        <div className="templates-grid">
          <div className="template-card">
            <div className="template-icon">
              <BarChart2 size={24} />
            </div>
            <div className="template-details">
              <h3>Regulatory Compliance Report</h3>
              <p>Comprehensive analysis of compliance status across all properties</p>
            </div>
            <button className="template-btn">Use Template</button>
          </div>
          
          <div className="template-card">
            <div className="template-icon">
              <PieChart size={24} />
            </div>
            <div className="template-details">
              <h3>Awaab's Law Dashboard</h3>
              <p>Focused report on damp and mould compliance metrics</p>
            </div>
            <button className="template-btn">Use Template</button>
          </div>
          
          <div className="template-card">
            <div className="template-icon">
              <Activity size={24} />
            </div>
            <div className="template-details">
              <h3>Response Time Analysis</h3>
              <p>Breakdown of issue response times vs regulatory requirements</p>
            </div>
            <button className="template-btn">Use Template</button>
          </div>
          
          <div className="template-card">
            <div className="template-icon">
              <Calendar size={24} />
            </div>
            <div className="template-details">
              <h3>Inspection Schedule Report</h3>
              <p>Overview of completed and upcoming property inspections</p>
            </div>
            <button className="template-btn">Use Template</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;

// pages/Settings.js
import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Clock, User, Shield, Database, Server } from 'react-feather';
import '../styles/Settings.css';

function Settings() {
  const [activeSection, setActiveSection] = useState('notifications');

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>
          <SettingsIcon size={24} />
          Settings
        </h1>
        <p className="settings-description">
          Configure system settings and notification preferences
        </p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <button 
            className={activeSection === 'notifications' ? 'active' : ''}
            onClick={() => setActiveSection('notifications')}
          >
            <Bell size={18} />
            Notifications
          </button>
          <button 
            className={activeSection === 'response' ? 'active' : ''}
            onClick={() => setActiveSection('response')}
          >
            <Clock size={18} />
            Response Times
          </button>
          <button 
            className={activeSection === 'users' ? 'active' : ''}
            onClick={() => setActiveSection('users')}
          >
            <User size={18} />
            User Management
          </button>
          <button 
            className={activeSection === 'compliance' ? 'active' : ''}
            onClick={() => setActiveSection('compliance')}
          >
            <Shield size={18} />
            Compliance Rules
          </button>
          <button 
            className={activeSection === 'sensors' ? 'active' : ''}
            onClick={() => setActiveSection('sensors')}
          >
            <Database size={18} />
            Sensor Configuration
          </button>
          <button 
            className={activeSection === 'system' ? 'active' : ''}
            onClick={() => setActiveSection('system')}
          >
            <Server size={18} />
            System Settings
          </button>
        </div>

        <div className="settings-content">
          {activeSection === 'notifications' && (
            <div className="notifications-settings">
              <h2>Notification Settings</h2>
              <div className="settings-section">
                <h3>Alert Notifications</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>High Priority Alerts</label>
                    <p className="setting-description">Get notified immediately for high priority alerts</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" checked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Medium Priority Alerts</label>
                    <p className="setting-description">Get notified for medium priority alerts</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" checked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Low Priority Alerts</label>
                    <p className="setting-description">Get notified for low priority alerts</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Notification Methods</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Email Notifications</label>
                    <p className="setting-description">Receive alerts and updates via email</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" checked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>SMS Notifications</label>
                    <p className="setting-description">Receive urgent alerts via SMS</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" checked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Mobile App Notifications</label>
                    <p className="setting-description">Receive push notifications on mobile app</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" checked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Notification Schedule</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Daily Summary</label>
                    <p className="setting-description">Receive a daily summary of alerts and issues</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" checked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <select className="time-select">
                      <option>08:00</option>
                      <option>09:00</option>
                      <option selected>17:00</option>
                      <option>18:00</option>
                    </select>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Weekly Report</label>
                    <p className="setting-description">Receive a weekly compliance summary</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" checked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <select className="day-select">
                      <option>Monday</option>
                      <option selected>Friday</option>
                      <option>Sunday</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="settings-actions">
                <button className="save-btn">Save Changes</button>
                <button className="reset-btn">Reset to Defaults</button>
              </div>
            </div>
          )}

          {activeSection === 'response' && (
            <div className="response-settings">
              <h2>Response Time Settings</h2>
              <p className="settings-intro">
                Configure maximum response times for different alert types in accordance with Awaab's Law and housing regulations.
              </p>
              
              <div className="settings-section">
                <h3>Damp & Mould Response Times</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>High Risk Mould Issues</label>
                    <p className="setting-description">Maximum response time for severe mould issues</p>
                  </div>
                  <div className="setting-control">
                    <input type="number" value="24" min="1" max="48" />
                    <span className="input-suffix">hours</span>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Medium Risk Mould Issues</label>
                    <p className="setting-description">Maximum response time for moderate mould issues</p>
                  </div>
                  <div className="setting-control">
                    <input type="number" value="3" min="1" max="7" />
                    <span className="input-suffix">days</span>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Low Risk Damp Issues</label>
                    <p className="setting-description">Maximum response time for minor dampness</p>
                  </div>
                  <div className="setting-control">
                    <input type="number" value="7" min="1" max="14" />
                    <span className="input-suffix">days</span>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Other Health & Safety Issues</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Gas Safety Issues</label>
                    <p className="setting-description">Maximum response time for gas safety concerns</p>
                  </div>
                  <div className="setting-control">
                    <input type="number" value="4" min="1" max="24" />
                    <span className="input-suffix">hours</span>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Electrical Safety Issues</label>
                    <p className="setting-description">Maximum response time for electrical issues</p>
                  </div>
                  <div className="setting-control">
                    <input type="number" value="24" min="1" max="48" />
                    <span className="input-suffix">hours</span>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Structural Issues</label>
                    <p className="setting-description">Maximum response time for structural concerns</p>
                  </div>
                  <div className="setting-control">
                    <input type="number" value="24" min="1" max="72" />
                    <span className="input-suffix">hours</span>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Escalation Rules</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>First Level Escalation</label>
                    <p className="setting-description">Escalate to team leader if unresolved within</p>
                  </div>
                  <div className="setting-control escalation-control">
                    <input type="number" value="75" min="50" max="100" />
                    <span className="input-suffix">% of max response time</span>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Second Level Escalation</label>
                    <p className="setting-description">Escalate to manager if unresolved within</p>
                  </div>
                  <div className="setting-control escalation-control">
                    <input type="number" value="90" min="75" max="100" />
                    <span className="input-suffix">% of max response time</span>
                  </div>
                </div>
              </div>
              
              <div className="settings-actions">
                <button className="save-btn">Save Changes</button>
                <button className="reset-btn">Reset to Defaults</button>
              </div>
            </div>
          )}

          {activeSection === 'compliance' && (
            <div className="compliance-settings">
              <h2>Compliance Rule Settings</h2>
              <p className="settings-intro">
                Configure thresholds and rules for determining property compliance status.
              </p>
              
              <div className="settings-section">
                <h3>Damp & Mould Thresholds (Awaab's Law)</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>High Risk Humidity Threshold</label>
                    <p className="setting-description">Humidity level that triggers high risk alerts</p>
                  </div>
                  <div className="setting-control">
                    <input type="number" value="75" min="60" max="90" />
                    <span className="input-suffix">%</span>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Medium Risk Humidity Threshold</label>
                    <p className="setting-description">Humidity level that triggers medium risk alerts</p>
                  </div>
                  <div className="setting-control">
                    <input type="number" value="70" min="60" max="90" />
                    <span className="input-suffix">%</span>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Mould Detection Threshold</label>
                    <p className="setting-description">VOC level that indicates potential mould growth</p>
                  </div>
                  <div className="setting-control">
                    <input type="number" value="250" min="100" max="500" />
                    <span className="input-suffix">ppb</span>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Temperature Thresholds</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Minimum Safe Temperature</label>
                    <p className="setting-description">Minimum temperature for habitable rooms</p>
                  </div>
                  <div className="setting-control">
                    <input type="number" value="18" min="10" max="25" />
                    <span className="input-suffix">°C</span>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Temperature Difference Alert</label>
                    <p className="setting-description">Maximum allowed difference between inside and surface temperature</p>
                  </div>
                  <div className="setting-control">
                    <input type="number" value="5" min="1" max="10" />
                    <span className="input-suffix">°C</span>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Property Compliance Classifications</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>High Risk Classification</label>
                    <p className="setting-description">Conditions for classifying a property as high risk</p>
                  </div>
                  <div className="setting-control multi-select">
                    <select multiple>
                      <option selected>Any active high priority alert</option>
                      <option selected>Multiple medium priority alerts</option>
                      <option selected>Confirmed mould growth</option>
                      <option>Persistent high humidity (>7 days)</option>
                      <option>Failed inspection in last 30 days</option>
                    </select>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>At Risk Classification</label>
                    <p className="setting-description">Conditions for classifying a property as at risk</p>
                  </div>
                  <div className="setting-control multi-select">
                    <select multiple>
                      <option selected>Any active medium priority alert</option>
                      <option selected>Multiple low priority alerts</option>
                      <option selected>Humidity consistently above threshold</option>
                      <option>Temperature consistently below minimum</option>
                      <option>Recent maintenance issues</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="settings-actions">
                <button className="save-btn">Save Changes</button>
                <button className="reset-btn">Reset to Defaults</button>
              </div>
            </div>
          )}

          {activeSection === 'sensors' && (
            <div className="sensors-settings">
              <h2>Sensor Configuration</h2>
              <p className="settings-intro">
                Configure sensor behavior, reading frequencies, and alert thresholds.
              </p>
              
              <div className="settings-section">
                <h3>Sensor Reading Frequency</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Temperature & Humidity Sensors</label>
                    <p className="setting-description">How often temperature and humidity sensors take readings</p>
                  </div>
                  <div className="setting-control">
                    <select>
                      <option>Every 5 minutes</option>
                      <option selected>Every 15 minutes</option>
                      <option>Every 30 minutes</option>
                      <option>Every hour</option>
                    </select>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Air Quality Sensors</label>
                    <p className="setting-description">How often CO2 and VOC sensors take readings</p>
                  </div>
                  <div className="setting-control">
                    <select>
                      <option>Every 5 minutes</option>
                      <option>Every 15 minutes</option>
                      <option selected>Every 30 minutes</option>
                      <option>Every hour</option>
                    </select>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>High Alert Mode Frequency</label>
                    <p className="setting-description">Increased frequency when values approach thresholds</p>
                  </div>
                  <div className="setting-control">
                    <select>
                      <option>Every minute</option>
                      <option selected>Every 5 minutes</option>
                      <option>Every 10 minutes</option>
                      <option>Every 15 minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Data Storage & Retention</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>High Resolution Data Retention</label>
                    <p className="setting-description">How long to keep detailed sensor reading data</p>
                  </div>
                  <div className="setting-control">
                    <select>
                      <option>1 month</option>
                      <option>3 months</option>
                      <option selected>6 months</option>
                      <option>12 months</option>
                    </select>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Aggregated Data Retention</label>
                    <p className="setting-description">How long to keep summarized sensor data</p>
                  </div>
                  <div className="setting-control">
                    <select>
                      <option>1 year</option>
                      <option>2 years</option>
                      <option selected>5 years</option>
                      <option>7 years</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Sensor Management</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Low Battery Alerts</label>
                    <p className="setting-description">Battery level that triggers alerts</p>
                  </div>
                  <div className="setting-control">
                    <input type="number" value="15" min="5" max="30" />
                    <span className="input-suffix">%</span>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Sensor Offline Alert</label>
                    <p className="setting-description">Time before triggering an offline alert</p>
                  </div>
                  <div className="setting-control">
                    <input type="number" value="2" min="1" max="24" />
                    <span className="input-suffix">hours</span>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Auto-Calibration</label>
                    <p className="setting-description">Automatically calibrate sensors periodically</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" checked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="settings-actions">
                <button className="save-btn">Save Changes</button>
                <button className="reset-btn">Reset to Defaults</button>
              </div>
            </div>
          )}
          
          {activeSection === 'users' && (
            <div className="users-settings">
              <h2>User Management</h2>
              <p className="settings-intro">
                Manage user accounts, roles, and permissions.
              </p>
              
              <div className="settings-section">
                <h3>User Accounts</h3>
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Last Active</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>John Doe</td>
                        <td>john.doe@example.com</td>
                        <td>Admin</td>
                        <td>Today, 10:23</td>
                        <td><span className="status active">Active</span></td>
                        <td>
                          <button className="small-btn">Edit</button>
                          <button className="small-btn secondary">Disable</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Jane Smith</td>
                        <td>jane.smith@example.com</td>
                        <td>Manager</td>
                        <td>Yesterday, 15:47</td>
                        <td><span className="status active">Active</span></td>
                        <td>
                          <button className="small-btn">Edit</button>
                          <button className="small-btn secondary">Disable</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Robert Lewis</td>
                        <td>robert.lewis@example.com</td>
                        <td>Technician</td>
                        <td>Today, 09:12</td>
                        <td><span className="status active">Active</span></td>
                        <td>
                          <button className="small-btn">Edit</button>
                          <button className="small-btn secondary">Disable</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Sarah Johnson</td>
                        <td>sarah.johnson@example.com</td>
                        <td>Inspector</td>
                        <td>2024-04-01</td>
                        <td><span className="status active">Active</span></td>
                        <td>
                          <button className="small-btn">Edit</button>
                          <button className="small-btn secondary">Disable</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Michael Brown</td>
                        <td>michael.brown@example.com</td>
                        <td>Inspector</td>
                        <td>2024-03-28</td>
                        <td><span className="status inactive">Inactive</span></td>
                        <td>
                          <button className="small-btn">Edit</button>
                          <button className="small-btn positive">Enable</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="add-user">
                  <button className="add-user-btn">
                    <span>+</span> Add New User
                  </button>
                </div>
              </div>

              <div className="settings-section">
                <h3>Role Management</h3>
                <div className="roles-table-container">
                  <table className="roles-table">
                    <thead>
                      <tr>
                        <th>Role</th>
                        <th>Description</th>
                        <th>Users</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Administrator</td>
                        <td>Full system access and configuration</td>
                        <td>1</td>
                        <td>
                          <button className="small-btn">Edit Permissions</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Manager</td>
                        <td>Can manage properties, alerts, and view reports</td>
                        <td>2</td>
                        <td>
                          <button className="small-btn">Edit Permissions</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Inspector</td>
                        <td>Can conduct inspections and update property status</td>
                        <td>3</td>
                        <td>
                          <button className="small-btn">Edit Permissions</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Technician</td>
                        <td>Can view and respond to maintenance tasks</td>
                        <td>5</td>
                        <td>
                          <button className="small-btn">Edit Permissions</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Viewer</td>
                        <td>Read-only access to property data</td>
                        <td>7</td>
                        <td>
                          <button className="small-btn">Edit Permissions</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="add-role">
                  <button className="add-role-btn">
                    <span>+</span> Add New Role
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'system' && (
            <div className="system-settings">
              <h2>System Settings</h2>
              <p className="settings-intro">
                Configure core system settings and integration options.
              </p>
              
              <div className="settings-section">
                <h3>System Configuration</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>System Name</label>
                    <p className="setting-description">Name displayed throughout the application</p>
                  </div>
                  <div className="setting-control">
                    <input type="text" value="Awaab's Law Compliance Monitor" />
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Organization Name</label>
                    <p className="setting-description">Your housing association's name</p>
                  </div>
                  <div className="setting-control">
                    <input type="text" value="Example Housing Association" />
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Data Backup Frequency</label>
                    <p className="setting-description">How often system data is backed up</p>
                  </div>
                  <div className="setting-control">
                    <select>
                      <option>Every 6 hours</option>
                      <option>Every 12 hours</option>
                      <option selected>Daily</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Integrations</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Property Management System</label>
                    <p className="setting-description">Connect to your existing property management system</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" checked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <select>
                      <option>Manual Sync</option>
                      <option>Hourly Sync</option>
                      <option selected>Daily Sync</option>
                      <option>Real-time Sync</option>
                    </select>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Work Order System</label>
                    <p className="setting-description">Connect to maintenance management system</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" checked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <select>
                      <option>Manual Sync</option>
                      <option selected>Hourly Sync</option>
                      <option>Daily Sync</option>
                      <option>Real-time Sync</option>
                    </select>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Regulatory Reporting API</label>
                    <p className="setting-description">Connect to regulatory reporting systems</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <button className="setup-btn">Configure</button>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Audit & Compliance</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Audit Logging</label>
                    <p className="setting-description">Record detailed system activity logs</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" checked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Regulatory Updates</label>
                    <p className="setting-description">Automatically download regulatory requirement updates</p>
                  </div>
                  <div className="setting-control">
                    <div className="toggle-group">
                      <label className="toggle">
                        <input type="checkbox" checked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <select>
                      <option>Manual Check</option>
                      <option>Weekly Check</option>
                      <option selected>Monthly Check</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="settings-actions">
                <button className="save-btn">Save Changes</button>
                <button className="reset-btn">Reset to Defaults</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;

// styles/index.css
/*
* Main styles file that imports all other style files
*/
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  /* Color variables */
  --primary-color: #1e40af;
  --primary-light: #3b82f6;
  --primary-dark: #1e3a8a;
  
  --secondary-color: #0f766e;
  --secondary-light: #14b8a6;
  --secondary-dark: #115e59;
  
  --background-color: #f8fafc;
  --card-background: #ffffff;
  
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-light: #94a3b8;
  
  --success-color: #22c55e;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --info-color: #3b82f6;
  
  --border-color: #e2e8f0;
  --border-active: #cbd5e1;
  
  /* Status colors for compliance */
  --compliant: #15803d;
  --monitor: #ca8a04;
  --at-risk: #ea580c;
  --high-risk: #be123c;
  
  /* Status colors for alerts */
  --new: #be123c;
  --assigned: #ca8a04;
  --in-progress: #0284c7;
  --scheduled: #4f46e5;
  --resolved: #15803d;
  
  /* EPC ratings */
  --epc-a: #008054;
  --epc-b: #19b459;
  --epc-c: #8dce46;
  --epc-d: #ffd500;
  --epc-e: #fcaa65;
  --epc-f: #ef8023;
  --epc-g: #e9153b;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-xxl: 3rem;
  
  /* Borders */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
  --border-radius-xl: 1rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  /* Font sizes */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  font-size: var(--font-size-md);
  color: var(--text-primary);
  background-color: var(--background-color);
  line-height: 1.5;
}

/* Common styles */
.label {
  font-weight: 500;
  color: var(--text-secondary);
}

.warning {
  color: var(--warning-color);
}

.danger {
  color: var(--danger-color);
}

.positive {
  color: var(--success-color);
}

button {
  cursor: pointer;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  transition: all 0.2s ease;
}

button:hover {
  opacity: 0.9;
}

button:active {
  transform: translateY(1px);
}

.action-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.action-btn.secondary {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.small-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--primary-light);
  color: white;
  font-size: var(--font-size-xs);
}

.small-btn.secondary {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.small-btn.positive {
  background-color: var(--success-color);
}

.view-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--primary-light);
  color: white;
  font-size: var(--font-size-xs);
  border-radius: var(--border-radius-sm);
}

/* Status colors */
.high-priority, .high-risk, .new {
  background-color: rgba(190, 18, 60, 0.1);
  color: var(--high-risk);
}

.medium-priority, .at-risk, .assigned {
  background-color: rgba(202, 138, 4, 0.1);
  color: var(--at-risk);
}

.low-priority, .monitor, .in-progress {
  background-color: rgba(2, 132, 199, 0.1);
  color: var(--in-progress);
}

.resolved, .compliant {
  background-color: rgba(21, 128, 61, 0.1);
  color: var(--compliant);
}

.scheduled {
  background-color: rgba(79, 70, 229, 0.1);
  color: var(--scheduled);
}

/* Common cards */
.card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-color);
}

/* Stat cards */
.stat-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  border: 1px solid var(--border-color);
}

.stat-card h3 {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
}

.stat-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--background-color);
  font-weight: 600;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  border-bottom: 2px solid var(--border-color);
}

td {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

tr:hover {
  background-color: var(--background-color);
}

/* Input styles */
input, select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  width: 100%;
  transition: border 0.2s ease;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--primary-light);
}

/* Chart containers */
.chart-container {
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-color);
}

.chart-container h2, .chart-container h3 {
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

/* App.css */
.app {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  margin-left: 240px;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

/* Sidebar.css */
.sidebar {
  width: 240px;
  background-color: var(--primary-dark);
  color: white;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.logo {
  margin-bottom: var(--spacing-xl);
}

.logo h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
}

.logo p {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.7);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: auto;
}

.nav a {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav a.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.user-info {
  margin-top: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: var(--primary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-details h4 {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.user-details p {
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.7);
}

/* Dashboard.css */
.dashboard {
  padding: var(--spacing-md);
}

.dashboard h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-sm);
}

.dashboard-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: white;
}

.stat-card.high-risk .stat-icon {
  background-color: var(--danger-color);
}

.stat-card.compliance .stat-icon {
  background-color: var(--success-color);
}

.stat-card.response .stat-icon {
  background-color: var(--info-color);
}

.stat-card.sensors .stat-icon {
  background-color: var(--secondary-color);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.recent-alerts {
  margin-top: var(--spacing-xl);
}

.recent-alerts h2 {
  margin-bottom: var(--spacing-md);
}

.alerts-table {
  margin-bottom: var(--spacing-md);
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.view-all-container {
  text-align: center;
  margin-top: var(--spacing-md);
}

.view-all-btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

/* Alerts.css */
.alerts-page {
  padding: var(--spacing-md);
}

.alerts-header {
  margin-bottom: var(--spacing-xl);
}

.alerts-header h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.alerts-description {
  color: var(--text-secondary);
}

.alerts-filters {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.search-box {
  position: relative;
  flex: 1;
}

.search-box input {
  padding-left: 36px;
  width: 100%;
}

.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.filter-controls {
  display: flex;
  gap: var(--spacing-md);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filter-group label {
  white-space: nowrap;
  color: var(--text-secondary);
}

.filter-group select {
  width: auto;
}

.alerts-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.summary-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.summary-card h3 {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.summary-number {
  font-size: var(--font-size-3xl);
  font-weight: 600;
}

.alerts-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.alert-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.alert-card.high {
  border-left: 4px solid var(--high-risk);
}

.alert-card.medium {
  border-left: 4px solid var(--at-risk);
}

.alert-card.low {
  border-left: 4px solid var(--monitor);
}

.alert-header {
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.alert-id {
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.alert-status {
  font-size: var(--font-size-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-weight: 500;
}

.alert-status.new {
  background-color: rgba(190, 18, 60, 0.1);
  color: var(--high-risk);
}

.alert-status.assigned {
  background-color: rgba(202, 138, 4, 0.1);
  color: var(--at-risk);
}

.alert-status.in-progress {
  background-color: rgba(2, 132, 199, 0.1);
  color: var(--in-progress);
}

.alert-status.scheduled {
  background-color: rgba(79, 70, 229, 0.1);
  color: var(--scheduled);
}

.alert-status.resolved {
  background-color: rgba(21, 128, 61, 0.1);
  color: var(--compliant);
}

.alert-property {
  font-weight: 600;
  font-size: var(--font-size-lg);
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-xs);
}

.alert-issue {
  padding: 0 var(--spacing-md) var(--spacing-md);
  color: var(--text-secondary);
}

.alert-details {
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  background-color: var(--background-color);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.alert-info {
  font-size: var(--font-size-sm);
}

.alert-info .label {
  color: var(--text-secondary);
  margin-right: var(--spacing-xs);
}

.alert-description {
  padding: var(--spacing-md);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  min-height: 100px;
}

.sensor-readings {
  display: flex;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background-color: var(--background-color);
}

.reading {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.reading-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.reading-value {
  font-weight: 600;
}

.alert-actions {
  padding: var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
}

.action-btn.view {
  background-color: var(--primary-color);
}

.action-btn.assign {
  background-color: var(--secondary-color);
}

.action-btn.update {
  background-color: var(--info-color);
}

.action-btn.close {
  background-color: var(--success-color);
}

/* Properties.css */
.properties-page {
  padding: var(--spacing-md);
}

.properties-header {
  margin-bottom: var(--spacing-xl);
}

.properties-header h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.properties-description {
  color: var(--text-secondary);
}

.properties-filters {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.properties-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.summary-card.high-risk {
  border-left: 4px solid var(--high-risk);
}

.summary-card.at-risk {
  border-left: 4px solid var(--at-risk);
}

.summary-card.monitor {
  border-left: 4px solid var(--monitor);
}

.summary-card.compliant {
  border-left: 4px solid var(--compliant);
}

.properties-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.property-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  padding: var(--spacing-lg);
  position: relative;
  text-decoration: none;
  color: var(--text-primary);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.property-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.compliance-indicator {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  border-top-left-radius: var(--border-radius-lg);
  border-bottom-left-radius: var(--border-radius-lg);
}

.compliance-indicator.high-risk {
  background-color: var(--high-risk);
}

.compliance-indicator.at-risk {
  background-color: var(--at-risk);
}

.compliance-indicator.monitor {
  background-color: var(--monitor);
}

.compliance-indicator.compliant {
  background-color: var(--compliant);
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.property-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.property-id {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--background-color);
  border-radius: var(--border-radius-sm);
}

.property-location {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.property-details {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.property-detail {
  font-size: var(--font-size-sm);
}

.property-detail .label {
  margin-right: var(--spacing-xs);
  color: var(--text-secondary);
}

.property-compliance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--background-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
}

.compliance-label {
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.property-card .high-risk .compliance-label {
  color: var(--high-risk);
}

.property-card .at-risk .compliance-label {
  color: var(--at-risk);
}

.property-card .monitor .compliance-label {
  color: var(--monitor);
}

.property-card .compliant .compliance-label {
  color: var(--compliant);
}

.last-inspection {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.property-monitoring {
  display: flex;
  justify-content: space-between;
}

.monitoring-item {
  font-size: var(--font-size-sm);
}

.monitoring-item .label {
  margin-right: var(--spacing-xs);
  color: var(--text-secondary);
}

.has-alerts {
  color: var(--danger-color);
  font-weight: 600;
}

.property-link {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  color: var(--primary-color);
  font-weight: 500;
  font-size: var(--font-size-sm);
  margin-top: auto;
}

/* PropertyDetail.css */
.property-detail-page {
  padding: var(--spacing-md);
}

.back-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
  width: fit-content;
}

.back-link:hover {
  color: var(--primary-color);
}

.property-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.compliance-badge {
  width: fit-content;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: white;
}

.compliance-badge.high-risk {
  background-color: var(--high-risk);
}

.compliance-badge.at-risk {
  background-color: var(--at-risk);
}

.compliance-badge.monitor {
  background-color: var(--monitor);
}

.compliance-badge.compliant {
  background-color: var(--compliant);
}

.property-meta {
  display: flex;
  gap: var(--spacing-lg);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.property-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.property-stats .stat-card {
  text-align: center;
}

.property-stats .stat-card h3 {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.property-stats .stat-value {
  font-size: var(--font-size-xl);
  font-weight: 600;
}

.stat-value.warning {
  color: var(--warning-color);
}

.epc-a { color: var(--epc-a); }
.epc-b { color: var(--epc-b); }
.epc-c { color: var(--epc-c); }
.epc-d { color: var(--epc-d); }
.epc-e { color: var(--epc-e); }
.epc-f { color: var(--epc-f); }
.epc-g { color: var(--epc-g); }

.property-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
}

.property-tabs button {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: transparent;
  border: none;
  color: var(--text-secondary);
  font-weight: 500;
  position: relative;
  font-size: var(--font-size-md);
}

.property-tabs button.active {
  color: var(--primary-color);
}

.property-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primary-color);
}

.alert-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: var(--danger-color);
  color: white;
  border-radius: 50%;
  font-size: var(--font-size-xs);
  margin-left: var(--spacing-sm);
}

.property-overview {
  margin-bottom: var(--spacing-xl);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: var(--spacing-lg);
}

.overview-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.overview-card h3 {
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-lg);
}

.sensor-summary, .alerts-summary, .next-inspection, .recent-maintenance {
  grid-column: span 1;
}

.humidity-chart, .temperature-chart {
  grid-column: span 3;
}

.sensor-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.sensor-stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.alerts-list-mini {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.alert-item-mini {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid transparent;
}

.alert-item-mini.high {
  background-color: rgba(190, 18, 60, 0.05);
  border-left-color: var(--high-risk);
}

.alert-item-mini.medium {
  background-color: rgba(202, 138, 4, 0.05);
  border-left-color: var(--at-risk);
}

.alert-item-mini.low {
  background-color: rgba(2, 132, 199, 0.05);
  border-left-color: var(--in-progress);
}

.alert-heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.alert-id {
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.alert-severity {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  font-weight: 600;
}

.alert-item-mini.high .alert-severity {
  color: var(--high-risk);
}

.alert-item-mini.medium .alert-severity {
  color: var(--at-risk);
}

.alert-item-mini.low .alert-severity {
  color: var(--in-progress);
}

.alert-type, .alert-location {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
}

.alert-detected {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.no-alerts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  color: var(--success-color);
}