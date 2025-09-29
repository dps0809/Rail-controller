# Railway Traffic Control System Dashboard

## 🚂 Project Overview

A comprehensive **Railway Traffic Control System** developed for **SIH 2025** that provides real-time monitoring, AI-powered decision support, and intelligent train scheduling for the **Pune-Baramati railway corridor**. This system empowers railway controllers with advanced tools for optimizing train operations, predicting delays, and managing complex railway networks efficiently.

![Railway Dashboard](https://img.shields.io/badge/SIH%202025-Railway%20Control-blue?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/React%2018-TypeScript-61DAFB?style=for-the-badge&logo=react)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)

## 🎯 Key Features

### 🎛️ **Intelligent Control Dashboard**
- **Real-time Train Monitoring**: Live tracking of trains
- **AI-Powered Recommendations**: Smart suggestions for optimal train routing
- **What-if Scenario Analysis**: Predictive modeling for different operational scenarios
- **KPI Dashboard**: Real-time metrics including throughput, delays, punctuality, and utilization

### 🗺️ **Advanced Mapping System**
- **Interactive Railway Network**: Visual representation 
- **Real-time Train Positions**: Live tracking with satellite imagery integration
- **Route Optimization**: Visual path planning and recommendation display
- **Google Maps Integration**: External mapping for detailed geographical context

### 📊 **Smart Analytics & Simulation**
- **Delay Prediction**: AI-powered forecasting of potential delays
- **Traffic Optimization**: Constraint programming for efficient scheduling
- **Simulation Engine**: Test scenarios before implementation
- **Performance Analytics**: Historical data analysis and trend visualization

### ⚡ **Operational Tools**
- **Train Schedule Management**: Dynamic scheduling with priority-based routing
- **Emergency Response**: Quick handling of disruptions and closures
- **Multi-modal Planning**: Support for Express, Passenger, and Freight trains
- **Audit Logging**: Complete operational history tracking

## 🏗️ System Architecture

### **Frontend Architecture**
```
client/
├── pages/
│   ├── Index.tsx              # Main dashboard (Console)
│   ├── NotFound.tsx           # 404 page
│   └── Placeholder.tsx        # Template for future pages
├── components/
│   ├── layout/
│   │   └── SiteHeader.tsx     # Navigation header
│   ├── rail/                  # Railway-specific components
│   │   ├── NetworkGraph.tsx   # Network visualization
│   │   ├── MumbaiPuneMap.tsx  # Interactive railway map
│   │   ├── KPISparkline.tsx   # Performance charts
│   │   └── RailwayMap.tsx     # Alternative map views
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── pune-baramati-graph.ts # Station and route data
│   └── utils.ts               # Utility functions
└── App.tsx                    # Main application entry
```

### **Backend Architecture**
```
server/
├── index.ts                   # Express server setup
├── routes/
│   └── demo.ts               # API route handlers
└── node-build.ts             # Production build configuration
```

## 🚀 Technology Stack

### **Core Technologies**
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Styling**: TailwindCSS 3 + Radix UI
- **Maps**: Leaflet + OpenStreetMap
- **State Management**: React Query + Local State
- **Build Tool**: Vite with SWC
- **Package Manager**: PNPM

### **UI/UX Libraries**
- **Component Library**: Radix UI primitives
- **Icons**: Lucide React
- **Charts**: Recharts + Custom SVG
- **Animations**: Framer Motion
- **Notifications**: Sonner + React Hot Toast

### **Development Tools**
- **TypeScript**: Full type safety
- **Testing**: Vitest
- **Linting**: ESLint + Prettier
- **Deployment**: Netlify ready

### **Technical Approach: Key Points**

The Railway Traffic Control System uses an Intelligent Hybrid System combining Graph Neural Networks, Constraint Programming, and Large Neighborhood Search.

1. **Data-to-Graph Conversion**
Data Ingestion: Raw JSON data and sensor inputs are transformed into a graph tensor representing the railway network using the Deep Graph Library (DGL).

2. **GNN for Initial Feasible Solution**
Initial Scheduling: A Supervised Trained Graph Neural Network (GNN) processes the graph tensor using a message-passing layer to quickly generate an initial, conflict-aware feasible solution (train schedule).

3. **LNS for Combinatorial Optimization**
Refinement Loop: The initial solution enters a Large Neighborhood Search (LNS) cycle for combinatorial optimization, aiming for global optimality. This cycle involves:

-Destroy: Identifying and removing conflicts/congestions in the schedule.

-Repair: Rebuilding the destroyed sections using a Constraint Programming (CP) solver with hard and soft constraints.

4. **Safety Protocol Validation**
Conflict Prevention: Every optimized schedule produced by the LNS/CP loop is rigorously checked by a Safety Protocol to ensure it is operationally safe and conflict-free before being recommended.

5. **Feedback and Adaptation**
Continuous Improvement: Operational results and controller actions are channeled back as Feedback to retrain the GNN and LNS algorithms, ensuring the system continually learns and adapts to real-time railway conditions.

## 📱 Dashboard Components

### **1. Control Panel (Left Sidebar)**
- **Section Selection**: Choose railway sections to monitor
- **Time Window Control**: Adjust monitoring timeframe (5-120 minutes)
- **Priority Sliders**: Set weights for Express/Passenger/Freight trains
- **Scenario Selection**: Normal/Maintenance/Congested operations
- **Action Buttons**: Get Recommendations, Run Simulation, Reset

<img width="398" height="683" alt="image" src="https://github.com/user-attachments/assets/96104b14-b706-47d1-915f-dd276f830414" />


### **2. What-if Scenarios Panel**
- **Train Order Scenarios**: Test different train sequencing (T001→T002→T003, etc.)
- **Weather Conditions**: Normal/Rain/Fog/Storm impact analysis
- **Station Closures**: Simulate temporary station shutdowns
- **AI vs Manual Comparison**: Compare automated vs manual planning
- **KPI Projections**: Real-time impact calculations

- <img width="399" height="729" alt="image" src="https://github.com/user-attachments/assets/2b40fd15-8b28-4be1-9266-1c7fb4b5a0ef" />


### **3. Main Dashboard (Center)**
- **Train Schedule Table**: Live train status with ETA, current position, speed
- **Interactive Railway Map**: Pune-Baramati corridor with real stations
- **Simulation Timeline**: Event tracking and progress monitoring
- **Performance Charts**: Throughput trends and delay distribution
- **Export Tools**: CSV export, PDF reports, map snapshots

1. <img width="998" height="414" alt="image" src="https://github.com/user-attachments/assets/e48d9ac4-ae54-4176-ac03-188942e46fff" />

2. <img width="935" height="824" alt="image" src="https://github.com/user-attachments/assets/b50af80b-c005-4c9d-aaff-4eb4e70c5e2a" />

3. <img width="935" height="277" alt="image" src="https://github.com/user-attachments/assets/318f5a9c-9767-4649-85b5-a4afc4713319" />


### **4. AI Recommendations (Right Sidebar)**
- **Smart Suggestions**: AI-generated optimization plans
- **Impact Metrics**: Throughput delta, delay reduction, confidence scores
- **Action Steps**: Detailed implementation instructions
- **Plan Controls**: Accept/Reject/Modify recommendations

- <img width="412" height="462" alt="image" src="https://github.com/user-attachments/assets/c4702cdc-b8f0-40e8-8b4e-cea2d7ae9727" />


### **5. KPI Dashboard**
- **Throughput**: Trains per hour (tph)
- **Average Delay**: Minutes behind schedule
- **Punctuality**: On-time performance percentage
- **Utilization**: Network capacity usage

- <img width="408" height="278" alt="image" src="https://github.com/user-attachments/assets/02cbe252-d582-4a75-9e0d-6d7038504fad" />


### **6. Audit Log**
- **Operator Actions**: Complete activity tracking
- **System Events**: Automated logging
- **Decision History**: Record of all recommendations and actions

- <img width="275" height="343" alt="image" src="https://github.com/user-attachments/assets/de9066e5-5032-4034-a35a-20a9a0fea185" />


## 🎮 How to Use the Dashboard

### **Getting Started**
1. **Launch Dashboard**: Navigate to the main console
2. **Select Section**: Choose your operational area
3. **Set Parameters**: Adjust time window and train priorities
4. **Monitor Status**: View real-time train positions and schedules

### **Running Simulations**
1. **Get Recommendation**: Click to generate AI suggestions
2. **Review Plan**: Examine proposed routing and timing changes
3. **Run Simulation**: Test the plan before implementation
4. **Monitor Results**: Track simulation progress and outcomes

### **What-if Analysis**
1. **Choose Scenario**: Select train ordering or weather conditions
2. **Set Parameters**: Configure closures or delays
3. **Review Impact**: Examine projected KPI changes

### **Emergency Response**
1. **Identify Issue**: Monitor alerts and status changes
2. **Access Tools**: Use what-if scenarios for quick planning
3. **Get Recommendations**: Leverage AI for optimal response
4. **Implement Solution**: Apply approved plans with tracking

## 🛠️ Development Setup

### **Prerequisites**
- Node.js 18+ 
- PNPM package manager
- Git

### **Installation**
```bash
# Clone repository
git clone <repository-url>
cd Rail-controller

# Install dependencies
npm install

# Start development server
npm run dev

```

### **Available Scripts**
```bash
npm run dev        # Start development server (port 8080)
npm run build      # Production build'

npm start          # Start production server
npm test           # Run tests
npm run typecheck  # TypeScript validation
```

### **Project Structure**
- **Single Port Development**: Frontend and backend on port 8080
- **Hot Reload**: Both client and server code
- **Type Safety**: Full TypeScript coverage
- **Path Aliases**: `@/` for client, `@shared/` for shared types

## 🚀 Deployment

### **Production Build**
```bash
pnpm build or npm build
```

### **Deployment Options**
- **Netlify**: Automatic deployment from Git
- **Vercel**: Serverless deployment
- **Traditional Hosting**: Static files + Node.js server
- **Docker**: Containerized deployment ready

## 🎯 SIH 2025 Innovation

### **Problem Statement Addressed**
- **Real-time Railway Traffic Management**
- **AI-powered Decision Support Systems**
- **Predictive Analytics for Transportation**
- **Smart Infrastructure Optimization**

### **Key Innovations**
1. **AI-Driven Recommendations**: Machine learning for optimal routing
2. **Real-time Visualization**: Interactive maps with live data
3. **Predictive Analytics**: What-if scenario modeling
4. **Integrated Dashboard**: Unified control interface
5. **Scalable Architecture**: Production-ready system design

### **Impact & Benefits**
- **Reduced Delays**: AI optimization minimizes cascade delays
- **Improved Efficiency**: Better resource utilization
- **Enhanced Safety**: Predictive analysis prevents conflicts
- **Cost Savings**: Optimized operations reduce operational costs
- **Better Passenger Experience**: Improved punctuality and service

## 🤝 Contributing

### **Development Guidelines**
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write tests for new features
- Update documentation for changes

### **Code Structure**
- **Components**: Reusable UI components in `/components`
- **Pages**: Route components in `/pages`
- **Utils**: Helper functions in `/lib`
- **Types**: Shared interfaces in `/shared`

## 📞 Support & Contact
### **Team Information**
- **Project**: SIH 2025 Railway Traffic Control System
- **Team members**:
- Yogesh Roat	yogeshroat4505@gmail.com
- Parth Soni parthmahecha1305@gmail.com
- Aashutosh Bharti aashu933ab@gmail.com
- Divya Prakash divyaprakash.hp1973@gmail.com
- Shravya shravyakalmadi@gmail.com
- Netranjali Vilas Patil netra412005@gmail.com

### **Technical Support**
- **Issues**: GitHub Issues for bug reports
- **Features**: Feature requests via GitHub
- **Documentation**: Inline code documentation
- **Testing**: Comprehensive test suite

---

## 🏆 SIH 2025 Submission

This Railway Traffic Control System represents a complete solution for modern railway operations, combining cutting-edge web technologies with AI-powered decision support to create an intelligent, scalable, and user-friendly platform for railway traffic management.

**Built with <3**
