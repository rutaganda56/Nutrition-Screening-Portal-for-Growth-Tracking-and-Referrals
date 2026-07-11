# Nutri Track

**Nutrition Screening Portal for Growth Tracking and Referrals**

Nutri Track is a comprehensive web application designed to empower healthcare providers to conduct, monitor, and manage child nutrition screenings. By streamlining the identification of malnutrition (Severe Acute Malnutrition - SAM, and Moderate Acute Malnutrition - MAM) and orchestrating clinical referrals, Nutri Track ensures timely interventions for at-risk patients.

## 🚀 Key Features

### 👥 Role-Based Access Control
- **Administrators**: Centralized system management. Manage healthcare facilities, oversee registered personnel (Doctors and CHWs), monitor system-wide malnutrition statistics, and handle security settings. Note: To ensure strict security, user registration is handled exclusively by Administrators.
- **Doctors**: Clinical oversight. Review critical nutritional screenings, perform advanced clinical assessments, prescribe nutrition orders (e.g., RUTF), and manage inbound/outbound patient referrals.
- **Community Health Workers (CHW)**: Frontline data collection. Register new patients, record anthropometric measurements (Weight, Height, MUAC, Z-Scores, Edema presence), and view patient histories directly from the field.

### 🩺 Nutrition Screening & Clinical Workflows
- **Growth Tracking**: Automated classification of nutritional status based on standardized metrics.
- **Service Requests**: CHWs can escalate severe cases to Doctors via integrated Service Requests.
- **Nutrition Orders**: Doctors can digitally prescribe and track therapeutic food supplements and dosages.
- **Referral System**: End-to-end management of patient transfers between health facilities for specialized care, including transport tracking and priority levels.

### 📊 Advanced Analytics & Dashboards
- Customized dashboards tailored to each role.
- Real-time aggregation of malnutrition statistics across various health facilities.
- Visual charts (Pie, Bar, Line) representing patient severity, screening frequencies, and facility capacity.
- Exportable reports for health administration and compliance.

### 🔒 Security
- Secure, stateless JWT (JSON Web Token) authentication.
- Encrypted password management with secure reset workflows (OTP/Email).
- Administrator-only user registration pipeline to prevent unauthorized system access.

## 🛠️ Technology Stack

**Frontend**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Shadcn UI (for sleek, modern component design)
- **Data Visualization**: Recharts
- **Icons**: Lucide React & Material UI Icons

**Backend**
- **Framework**: Java 17 & Spring Boot 3
- **Security**: Spring Security (JWT)
- **Data Access**: Spring Data JPA / Hibernate
- **Database**: H2 (Development) / PostgreSQL (Production)
- **Build Tool**: Maven

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- Java JDK 17+
- Maven 3.8+

### Running the Frontend
1. Navigate to the project root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:5173`.

### Running the Backend
1. Navigate to the backend directory:
   ```bash
   cd nutritrack-api
   ```
2. Clean and compile the application:
   ```bash
   mvn clean compile
   ```
3. Run the Spring Boot server:
   ```bash
   mvn spring-boot:run
   ```
4. The API will be available at `http://localhost:8080`.

## 🎨 Design Reference
The original UI/UX design is available at [Figma - Nutri Track](https://www.figma.com/design/J1aNJtqAwvJBm9hi5DdZDb/Nutri-Track).