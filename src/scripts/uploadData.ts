// Upload script for Buzzword financial data
import { uploadFinancialData } from '../services/financialDataService';

const uploadData = async () => {
  try {
    console.log('Starting data upload...');
    await uploadFinancialData();
    console.log('✅ Data uploaded successfully!');
  } catch (error) {
    console.error('❌ Error uploading data:', error);
  }
};

// Uncomment to run:
// uploadData();

export { uploadData };
