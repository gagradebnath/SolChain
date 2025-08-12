# IoT Simulator - SolChain Device Simulation

## Overview
The IoT simulator component provides realistic simulation of smart meters, solar panels, and other energy-related IoT devices for the SolChain platform. It generates synthetic data that mimics real-world energy consumption patterns, solar production cycles, and device behaviors for development and testing purposes.

## Technology Stack
- **Runtime**: Node.js (v16+)
- **Communication**: MQTT, LoRaWAN simulation, HTTP/HTTPS
- **Data Generation**: Realistic algorithms based on weather, time, and usage patterns
- **Protocols**: CoAP, MQTT, HTTP REST APIs
- **Time Series**: Real-time and historical data generation
- **Location Services**: GPS coordinate simulation
- **Weather Integration**: OpenWeatherMap API for realistic solar simulation

## Project Structure
```
src/
├── simulator.js              # Main simulator orchestrator
├── communication/           # Communication protocol simulations
│   └── lpwanSimulator.js   # LPWAN/LoRaWAN communication simulation
├── smart-meters/           # Smart meter device simulations
│   └── smartMeterSimulator.js # Energy consumption monitoring
└── solar-panels/           # Solar panel device simulations
    └── solarPanelSimulator.js # Solar energy production simulation

config/
├── devices.json            # Device configuration templates
├── scenarios.json          # Simulation scenarios
└── locations.json          # Geographic locations for simulation

data/
├── consumption-patterns/   # Historical consumption data templates
├── weather-data/          # Weather pattern templates
└── device-profiles/       # Device specification profiles
```

## Setup Instructions

### Prerequisites
```bash
# Node.js v16 or higher
node --version

# Navigate to iot-simulator directory
cd iot-simulator

# Install dependencies
npm install
```

### Environment Configuration
```bash
# Create .env file
cp .env.example .env
```

### Environment Variables
```bash
# .env file
MQTT_BROKER_URL=mqtt://localhost:1883
API_ENDPOINT=http://localhost:3001/api
WEATHER_API_KEY=your_openweather_api_key
SIMULATION_INTERVAL=5000
DEVICE_COUNT=50
LOG_LEVEL=info
ENABLE_REALISTIC_PATTERNS=true
```

### Running the Simulator
```bash
# Start all device simulations
npm start

# Run specific device type only
npm run simulate:meters
npm run simulate:solar
npm run simulate:communication

# Run with custom configuration
npm run simulate -- --config custom-config.json

# Run in debug mode
npm run debug
```

## Device Simulations

### Smart Meter Simulator (`smart-meters/smartMeterSimulator.js`)

**Purpose**: Simulates residential and commercial smart meters that monitor energy consumption

**Key Features**:
- Realistic consumption patterns based on time of day, season, and building type
- Multiple building types: residential, commercial, industrial
- Appliance-level consumption breakdown
- Peak and off-peak usage patterns
- Seasonal variations and weather impact
- Meter reading accuracy simulation (±2% variance)
- Power quality measurements (voltage, frequency, power factor)

**Device Types**:
```javascript
const deviceTypes = {
  RESIDENTIAL_SMALL: {
    baseConsumption: 2.5, // kWh daily average
    peakMultiplier: 2.0,
    appliances: ['hvac', 'water_heater', 'refrigerator', 'lighting', 'electronics']
  },
  RESIDENTIAL_LARGE: {
    baseConsumption: 8.0,
    peakMultiplier: 2.5,
    appliances: ['hvac', 'water_heater', 'pool_pump', 'ev_charger', 'home_office']
  },
  COMMERCIAL_SMALL: {
    baseConsumption: 15.0,
    peakMultiplier: 1.8,
    appliances: ['lighting', 'hvac', 'computers', 'security_systems']
  },
  INDUSTRIAL: {
    baseConsumption: 100.0,
    peakMultiplier: 1.5,
    appliances: ['machinery', 'lighting', 'hvac', 'compressed_air']
  }
};
```

**Data Generation**:
```javascript
// Example consumption pattern
{
  deviceId: "SM_001_RES_SMALL",
  timestamp: "2025-08-13T14:30:00Z",
  consumption: {
    total: 3.2, // kWh current reading
    instantaneous: 2.8, // kW current power draw
    appliances: {
      hvac: 1.5,
      water_heater: 0.8,
      refrigerator: 0.3,
      lighting: 0.2,
      electronics: 0.4
    }
  },
  powerQuality: {
    voltage: 240.2,
    frequency: 59.98,
    powerFactor: 0.92
  },
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    address: "123 Main St, New York, NY"
  },
  metadata: {
    meterType: "digital",
    accuracy: 0.98,
    lastCalibration: "2025-07-01T00:00:00Z"
  }
}
```

**Consumption Patterns**:
- **Morning Peak**: 6:00-9:00 AM (1.5x base consumption)
- **Daytime Low**: 9:00 AM-5:00 PM (0.7x base consumption)
- **Evening Peak**: 5:00-10:00 PM (2.0x base consumption)
- **Nighttime**: 10:00 PM-6:00 AM (0.4x base consumption)

### Solar Panel Simulator (`solar-panels/solarPanelSimulator.js`)

**Purpose**: Simulates solar panel installations with realistic energy production based on weather, time, and panel specifications

**Key Features**:
- Weather-dependent energy production
- Time-of-day and seasonal variations
- Panel efficiency degradation over time
- Shading and soiling effects
- Multiple panel technologies (monocrystalline, polycrystalline, thin-film)
- Inverter efficiency simulation
- Maximum Power Point Tracking (MPPT) simulation

**Panel Configurations**:
```javascript
const panelTypes = {
  RESIDENTIAL_ROOFTOP: {
    capacity: 5.0, // kW
    efficiency: 0.20,
    panelCount: 20,
    technology: 'monocrystalline',
    tiltAngle: 30,
    azimuthAngle: 180 // south-facing
  },
  COMMERCIAL_ROOFTOP: {
    capacity: 25.0,
    efficiency: 0.22,
    panelCount: 100,
    technology: 'monocrystalline',
    tiltAngle: 10,
    azimuthAngle: 180
  },
  UTILITY_SCALE: {
    capacity: 1000.0,
    efficiency: 0.21,
    panelCount: 4000,
    technology: 'polycrystalline',
    tiltAngle: 25,
    azimuthAngle: 180,
    tracking: 'single_axis'
  }
};
```

**Production Calculation**:
```javascript
// Solar irradiance model
function calculateProduction(panelConfig, weatherData, timestamp) {
  const sunPosition = calculateSunPosition(timestamp, panelConfig.location);
  const irradiance = calculateIrradiance(weatherData, sunPosition);
  const temperatureEffect = calculateTemperatureDerating(weatherData.temperature);
  const shadingEffect = calculateShading(timestamp, panelConfig.surroundings);
  
  const production = panelConfig.capacity * 
                    irradiance * 
                    panelConfig.efficiency * 
                    temperatureEffect * 
                    shadingEffect;
  
  return Math.max(0, production);
}
```

**Data Generation**:
```javascript
// Example production data
{
  deviceId: "SP_001_RES_5KW",
  timestamp: "2025-08-13T14:30:00Z",
  production: {
    instantaneous: 4.2, // kW current production
    daily: 28.5, // kWh produced today
    lifetime: 45230.8 // kWh total lifetime production
  },
  performance: {
    efficiency: 0.198, // Current panel efficiency
    performanceRatio: 0.85, // System performance ratio
    inverterEfficiency: 0.96,
    temperatureCoefficient: -0.004 // per degree C
  },
  environmental: {
    irradiance: 850, // W/m²
    cellTemperature: 45.2, // °C
    ambientTemperature: 28.5, // °C
    windSpeed: 2.3 // m/s
  },
  system: {
    dcVoltage: 380.5,
    dcCurrent: 11.2,
    acVoltage: 240.1,
    acCurrent: 17.5
  }
}
```

### Communication Simulator (`communication/lpwanSimulator.js`)

**Purpose**: Simulates Low Power Wide Area Network (LPWAN) communication protocols like LoRaWAN for IoT devices

**Key Features**:
- LoRaWAN protocol simulation
- Message transmission delays and failures
- Signal strength variation based on distance
- Battery level simulation for devices
- Network congestion effects
- Data packet loss and retransmission

**Communication Protocols**:
```javascript
const protocols = {
  LORAWAN: {
    range: 15000, // meters in urban areas
    dataRate: 50000, // bps maximum
    batteryLife: 8760, // hours (1 year typical)
    reliability: 0.95,
    latency: 1000 // milliseconds
  },
  NBIOT: {
    range: 35000,
    dataRate: 200000,
    batteryLife: 4380, // 6 months
    reliability: 0.99,
    latency: 500
  },
  SIGFOX: {
    range: 40000,
    dataRate: 100,
    batteryLife: 17520, // 2 years
    reliability: 0.90,
    latency: 2000
  }
};
```

## Simulation Scenarios

### Scenario 1: Residential Neighborhood
```json
{
  "name": "suburban_neighborhood",
  "description": "50 homes with varying energy profiles",
  "duration": "24h",
  "devices": [
    {
      "type": "smart_meter",
      "count": 50,
      "profile": "residential_mixed"
    },
    {
      "type": "solar_panel",
      "count": 25,
      "profile": "residential_rooftop"
    }
  ],
  "location": {
    "name": "Suburban Dallas, TX",
    "coordinates": [32.7767, -96.7970],
    "weather": "sunny_hot_summer"
  }
}
```

### Scenario 2: Commercial District
```json
{
  "name": "commercial_district",
  "description": "Mixed commercial buildings with large solar installations",
  "duration": "1week",
  "devices": [
    {
      "type": "smart_meter",
      "count": 20,
      "profile": "commercial_mixed"
    },
    {
      "type": "solar_panel",
      "count": 15,
      "profile": "commercial_rooftop"
    }
  ],
  "events": [
    {
      "type": "peak_demand",
      "time": "weekdays 14:00-16:00",
      "multiplier": 1.5
    }
  ]
}
```

### Scenario 3: Microgrid Community
```json
{
  "name": "microgrid_community",
  "description": "Autonomous microgrid with energy storage and trading",
  "duration": "1month",
  "devices": [
    {
      "type": "smart_meter",
      "count": 100,
      "profile": "mixed_residential_commercial"
    },
    {
      "type": "solar_panel",
      "count": 80,
      "profile": "community_solar"
    },
    {
      "type": "battery_storage",
      "count": 20,
      "profile": "home_battery"
    }
  ],
  "trading": {
    "enabled": true,
    "priceRange": [0.08, 0.25],
    "tradingHours": "all_day"
  }
}
```

## Data Patterns and Algorithms

### Weather Impact Modeling
```javascript
// Solar production based on weather
function applyWeatherEffects(baseProduction, weather) {
  let production = baseProduction;
  
  // Cloud cover impact
  const cloudReduction = weather.cloudCover * 0.8;
  production *= (1 - cloudReduction);
  
  // Rain impact
  if (weather.precipitation > 0) {
    production *= 0.3; // Heavy reduction during rain
  }
  
  // Temperature impact (panels less efficient when hot)
  const tempEffect = Math.max(0.7, 1 - (weather.temperature - 25) * 0.004);
  production *= tempEffect;
  
  // Snow coverage (winter simulation)
  if (weather.snow > 0) {
    production *= 0.1; // Panels covered
  }
  
  return Math.max(0, production);
}
```

### Consumption Behavior Modeling
```javascript
// Human behavior patterns
function generateConsumptionProfile(deviceType, timestamp, weather) {
  const hour = new Date(timestamp).getHours();
  const dayOfWeek = new Date(timestamp).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  let consumption = deviceType.baseConsumption;
  
  // Time of day patterns
  const timeMultipliers = {
    residential: [0.4, 0.4, 0.4, 0.4, 0.5, 0.8, 1.2, 1.5, 1.0, 0.8, 0.7, 0.7, 0.8, 0.9, 1.0, 1.2, 1.5, 1.8, 1.6, 1.4, 1.2, 1.0, 0.8, 0.6],
    commercial: [0.2, 0.2, 0.2, 0.2, 0.3, 0.5, 0.8, 1.2, 1.5, 1.6, 1.6, 1.6, 1.4, 1.6, 1.6, 1.6, 1.4, 1.2, 0.8, 0.5, 0.3, 0.2, 0.2, 0.2]
  };
  
  consumption *= timeMultipliers[deviceType.category][hour];
  
  // Weekend patterns (residential higher, commercial lower)
  if (isWeekend && deviceType.category === 'residential') {
    consumption *= 1.2;
  } else if (isWeekend && deviceType.category === 'commercial') {
    consumption *= 0.3;
  }
  
  // Weather impact on consumption (heating/cooling)
  if (weather.temperature > 25) {
    consumption *= (1 + (weather.temperature - 25) * 0.03); // AC usage
  } else if (weather.temperature < 15) {
    consumption *= (1 + (15 - weather.temperature) * 0.02); // Heating usage
  }
  
  return consumption;
}
```

## Real-time Data Streaming

### MQTT Integration
```javascript
// MQTT client for real-time data publishing
const mqtt = require('mqtt');
const client = mqtt.connect(process.env.MQTT_BROKER_URL);

function publishDeviceData(deviceId, data) {
  const topic = `solchain/devices/${deviceId}/data`;
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    deviceId: deviceId,
    ...data
  });
  
  client.publish(topic, payload, { qos: 1 });
}

// Subscribe to device commands
client.subscribe('solchain/devices/+/commands');
client.on('message', (topic, message) => {
  const deviceId = topic.split('/')[2];
  const command = JSON.parse(message.toString());
  handleDeviceCommand(deviceId, command);
});
```

### WebSocket Streaming
```javascript
// WebSocket server for real-time dashboard updates
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Dashboard connected');
  
  // Send real-time device updates
  setInterval(() => {
    const deviceUpdates = getAllDeviceCurrentData();
    ws.send(JSON.stringify({
      type: 'device_updates',
      data: deviceUpdates
    }));
  }, 5000);
});
```

## Performance and Scalability

### Optimizations
- **Batch Processing**: Group device updates for efficient transmission
- **Data Compression**: Use gzip compression for large datasets
- **Memory Management**: Efficient circular buffers for time series data
- **CPU Optimization**: Parallel processing for multiple device simulations
- **Network Efficiency**: Minimize redundant data transmission

### Scalability Metrics
- **Device Capacity**: Up to 10,000 simulated devices per instance
- **Data Rate**: 100,000 measurements per minute
- **Memory Usage**: ~100MB for 1,000 devices
- **CPU Usage**: ~20% for full simulation load
- **Network Bandwidth**: ~10Mbps for real-time streaming

## Testing and Validation

### Data Validation
```bash
# Validate simulation data quality
npm run validate:data

# Check consumption patterns match real-world data
npm run validate:patterns

# Verify solar production calculations
npm run validate:solar

# Test communication protocol accuracy
npm run validate:communication
```

### Performance Testing
```bash
# Stress test with maximum device count
npm run test:stress

# Memory leak detection
npm run test:memory

# Network performance testing
npm run test:network
```

## Configuration Options

### Device Configuration (`config/devices.json`)
```json
{
  "defaultSettings": {
    "updateInterval": 5000,
    "dataRetention": "30days",
    "errorRate": 0.02,
    "maintenanceWindows": ["Sunday 02:00-04:00"]
  },
  "smartMeters": {
    "residential": {
      "baseConsumption": 2.5,
      "variability": 0.3,
      "peakHours": ["07:00-09:00", "17:00-21:00"]
    }
  },
  "solarPanels": {
    "residential": {
      "capacity": 5.0,
      "efficiency": 0.20,
      "degradationRate": 0.005
    }
  }
}
```

### Scenario Configuration (`config/scenarios.json`)
```json
{
  "scenarios": [
    {
      "name": "peak_summer_day",
      "weather": {
        "temperature": 35,
        "humidity": 0.6,
        "cloudCover": 0.1,
        "irradiance": 900
      },
      "multipliers": {
        "cooling_load": 2.5,
        "solar_production": 1.2
      }
    }
  ]
}
```

## Monitoring and Logging

### Metrics Dashboard
- Device simulation health
- Data generation rates
- Communication success rates
- System resource usage
- Error rates and types

### Logging Configuration
```javascript
// winston logger configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'simulator.log' }),
    new winston.transports.Console()
  ]
});
```

## Integration with SolChain Platform

### API Integration
```javascript
// Send simulated data to backend API
async function sendToAPI(deviceData) {
  try {
    const response = await fetch(`${API_ENDPOINT}/iot/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(deviceData)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  } catch (error) {
    logger.error('Failed to send data to API:', error);
  }
}
```

### Blockchain Integration
```javascript
// Submit energy production data to smart contracts
async function submitToBlockchain(productionData) {
  const web3 = new Web3(process.env.BLOCKCHAIN_RPC);
  const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
  
  try {
    await contract.methods.recordEnergyProduction(
      productionData.deviceId,
      Math.floor(productionData.amount * 1000), // Convert to Wei-like units
      productionData.timestamp
    ).send({ from: SIMULATOR_ADDRESS });
  } catch (error) {
    logger.error('Blockchain submission failed:', error);
  }
}
```

## Future Enhancements

### Planned Features
1. **Advanced Weather Integration**: Real-time weather API integration
2. **Machine Learning**: Predictive consumption patterns
3. **Fault Simulation**: Device failure and maintenance scenarios
4. **Grid Simulation**: Power grid stability and outage simulation
5. **Electric Vehicle**: EV charging station simulation
6. **Energy Storage**: Battery storage system simulation
7. **Demand Response**: Automated load reduction simulation

### Research Areas
- Digital twin technology for precise device modeling
- AI-generated consumption patterns
- Blockchain-based device identity
- Edge computing simulation
- 5G communication protocols
