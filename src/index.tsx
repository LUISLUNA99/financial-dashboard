import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('🚀 Iniciando aplicación React...');

try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('No se encontró el elemento root');
  }
  
  console.log('✅ Elemento root encontrado:', rootElement);
  
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('✅ Root de React creado');
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('✅ App renderizada correctamente');
  
} catch (error) {
  console.error('❌ Error al inicializar la aplicación:', error);
  
  // Mostrar error en el DOM
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1 style="color: #e74c3c;">Error al cargar la aplicación</h1>
        <p style="color: #7f8c8d;">Detalles del error: ${errorMessage}</p>
        <p style="color: #7f8c8d;">Revisa la consola del navegador para más información.</p>
      </div>
    `;
  }
}
