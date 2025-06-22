# 📊 Dashboard Financiero Avanzado

Un dashboard financiero moderno y completo construido con React, TypeScript, y Supabase, que incluye análisis interactivos, métricas en tiempo real, sistema de autenticación elegante, y un sistema completo de reportes financieros.

## 🔐 **NUEVO: Sistema de Autenticación**

### Acceso Seguro con Login Elegante
- **Pantalla de login moderna** con efectos glassmorphism
- **Autenticación persistente** con localStorage
- **Roles de usuario** (Administrador, Usuario, Visualizador)
- **Credenciales demo** para pruebas rápidas

### 🎫 Credenciales de Prueba
```
🔑 Administrador: admin@inovitz.com / admin123
👤 Usuario: user@buzzword.com / user123  
👁️ Visualizador: viewer@empresa.com / viewer123
```

## ✨ Características Principales

### 🎯 **Dashboard Completo con 12 Secciones**
1. **🔐 Sistema de Login** - Autenticación elegante y segura
2. **Dashboard Principal** - Gráficos de ingresos vs gastos
3. **Reporte Mensual** - Análisis detallado mensual
4. **Ingresos Mensuales** - Comparación planificado vs real
5. **KPIs Financieros** - Métricas de rentabilidad (Gross Margin, EBIT)
6. **Comparación 2024 vs 2025** - Análisis interanual con tarjetas modernas
7. **📊 Dashboard Ejecutivo** - Vista de alto nivel con KPIs clave
8. **🚨 Sistema de Alertas** - Alertas inteligentes y categorizadas
9. **📄 Exportador de Reportes** - Generación en PDF, Excel, CSV, PNG
10. **⚡ Métricas en Tiempo Real** - Simulación de datos en vivo con diseño moderno
11. **🔍 Filtros Avanzados** - Filtrado por empresa, categoría y períodos
12. **🎯 Objetivos y Progreso** - Seguimiento de metas con gauges interactivos

### 🎨 **Diseño Visual Moderno**
- **Sistema de autenticación** con glassmorphism y animaciones
- **Header de usuario** con información del perfil y logout
- **Tarjetas con efectos hover** y animaciones suaves
- **Gradientes coloridos** y elementos glassmorphism
- **Sistema de badges** y indicadores de progreso
- **Responsive design** optimizado para todos los dispositivos

### 📊 **Análisis Financiero Avanzado**
- **Datos reales de BUZZWORD** integrados desde CSV
- **Métricas YTD** (Year-to-Date) con objetivos anuales
- **Comparación 2024 vs 2025** por proyecto y empresa
- **Alertas automáticas** por cambios significativos
- **Exportación multi-formato** de todos los reportes

### 🔄 **Integración con Supabase**
- **Datos en tiempo real** con actualización automática
- **Tablas estructuradas** para reportes financieros
- **API REST** para consultas optimizadas
- **Políticas de seguridad** configuradas

## 🛠 Stack Tecnológico

- **Frontend**: React 18, TypeScript, styled-components
- **Charts**: Apache ECharts with ReactECharts
- **Database**: Supabase (PostgreSQL)
- **Data Processing**: Custom CSV parsing for financial data
- **Styling**: styled-components with HSL color system
- **Animations**: framer-motion
- **Icons**: Lucide React
- **Notifications**: react-hot-toast

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd financial-dashboard

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Note**: The app will use mock data if these environment variables are not set, allowing you to test without setting up Supabase.

### 3. Database Setup (Optional)

If you want to use real Supabase data:

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL script in `supabase-setup.sql` in your Supabase SQL editor
3. Update your `.env` file with the correct URLs and keys

### 4. Run the Application

```bash
npm start
```

The application will open at `http://localhost:3000`

## 🎯 Current Project Status

### ✅ Completed Features
- ✅ **Application Setup**: React TypeScript application running successfully
- ✅ **UI Components**: Modern V0.dev-style interface with tab navigation
- ✅ **Dashboard View**: Complete financial dashboard with interactive charts
- ✅ **Monthly Revenue Report**: Tab system for switching between dashboard and revenue reports
- ✅ **Database Schema**: Comprehensive Supabase setup with financial data tables
- ✅ **CSV Data Processing**: DATABUZZWORD.csv integration with financial data service
- ✅ **TypeScript Integration**: Full type safety with custom interfaces
- ✅ **Mock Data**: Working application with sample data
- ✅ **Build System**: Clean compilation without errors

### 🔄 Next Steps
1. **Supabase Database Setup**: Execute the `supabase-setup.sql` script in your Supabase project
2. **Environment Configuration**: Set up proper Supabase credentials in `.env`
3. **Data Upload**: Run the financial data upload script to populate Buzzword data
4. **Authentication**: Implement user authentication system
5. **Real Data Testing**: Switch from mock data to live Supabase data

### 📊 CSV Data Integration
The project includes integration with `DATABUZZWORD.csv` containing Buzzword company financial data:
- **Revenue Data**: Monthly income targets vs actual income
- **Expense Categories**: R&D, Operations, Marketing, etc.
- **Financial Reports**: Year-over-year comparison and variance analysis
- **Database Tables**: `financial_reports` and `monthly_revenue` tables for structured data storage

## 📁 Project Structure

```
financial-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Chart.tsx          # ECharts wrapper component
│   │   ├── UserProfile.tsx    # User profile sidebar
│   │   └── ui/                # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       └── index.ts
│   ├── pages/
│   │   └── Dashboard.tsx      # Main dashboard page
│   ├── services/
│   │   ├── supabaseClient.ts  # Supabase integration
│   │   └── mockData.ts        # Development mock data
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── App.tsx               # Main app component
│   └── index.tsx             # App entry point
├── .env.example              # Environment variables template
├── supabase-setup.sql        # Database setup script
└── package.json
```

## 🎨 Design System

The dashboard uses a modern design system inspired by V0.dev with:

- **Color Palette**: HSL-based color system
- **Typography**: Inter font family
- **Spacing**: Consistent 8px grid system
- **Animations**: Smooth framer-motion transitions
- **Components**: Reusable UI components with variants

### Color Tokens

```css
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--card: 0 0% 100%
--border: 214.3 31.8% 91.4%
--primary: 221.2 83.2% 53.3%
--muted: 210 40% 96%
```

## 📊 Features Overview

### Dashboard Statistics
- Total income tracking
- Total expenses monitoring
- Current balance calculation
- Budget usage percentage
- Monthly growth indicators

### Interactive Charts
- **Income vs Expenses**: Line chart showing monthly trends
- **Expense Categories**: Pie chart breakdown
- **Responsive Design**: Adapts to different screen sizes

### Transaction Management
- Recent transactions list
- Transaction categorization
- Income/expense type indicators
- Date formatting and filtering

### User Profile
- User information display
- Avatar support
- Statistics summary
- Profile management

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL | No* |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anonymous key | No* |

*Required only for production with real data

### Mock Data

When Supabase is not configured, the app automatically uses mock data including:
- Sample user profiles
- Transaction history
- Account balances
- Budget information
- Dashboard statistics

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify/Vercel

1. Build the project: `npm run build`
2. Deploy the `build` folder to your hosting platform
3. Set environment variables in your hosting platform's settings

## 🔐 Database Schema

The application uses the following database tables:

- **profiles**: User profile information
- **accounts**: User bank accounts
- **transactions**: Financial transactions
- **budgets**: Budget categories and limits

See `supabase-setup.sql` for the complete schema.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Ensure all dependencies are installed: `npm install`
4. Try using mock data first (without Supabase setup)

## 🔄 Development Status

✅ **Completed Features:**
- Modern React 18 + TypeScript setup
- Comprehensive UI component library
- Supabase client integration
- Dashboard with statistics cards
- Interactive ECharts visualizations
- Responsive design system
- Mock data for development
- User profile management
- Transaction list display

🔄 **Current Status:**
- Application successfully compiles and runs
- All TypeScript errors resolved
- Modern V0.dev-style design implemented
- Mock data integration working

📋 **Next Steps:**
- Set up actual Supabase database
- Implement real user authentication
- Add transaction CRUD operations
- Enhanced filtering and search
- Mobile app optimization
- Additional chart types