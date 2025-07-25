import { loadProto } from './utils/proto-loader';


// Test loading each proto file
console.log('Testing proto file loading...');
import { authProto, checkProto, clientProto, customerProto, validateProto } from './utils/protos';

try {
  // Test loading auth.proto
  const authService = loadProto(authProto, 'auth', 'AuthService');
  console.log('✅ Successfully loaded auth.proto');
} catch (error) {
  console.error('❌ Failed to load auth.proto:', error.message);
}

try {
  // Test loading check.proto
  const checkService = loadProto(checkProto, 'check', 'CheckService');
  console.log('✅ Successfully loaded check.proto');
} catch (error) {
  console.error('❌ Failed to load check.proto:', error.message);
}

try {
  // Test loading client.proto
  const clientService = loadProto(clientProto, 'client', 'ClientService');
  console.log('✅ Successfully loaded client.proto');
} catch (error) {
  console.error('❌ Failed to load client.proto:', error.message);
}

try {
  // Test loading customer.proto
  const customerService = loadProto(customerProto, 'customer', 'CustomerService');
  console.log('✅ Successfully loaded customer.proto');
} catch (error) {
  console.error('❌ Failed to load customer.proto:', error.message);
}

try {
  // Test loading validate.proto
  const validateService = loadProto(validateProto, 'validate', 'ValidateService');
  console.log('✅ Successfully loaded validate.proto');
} catch (error) {
  console.error('❌ Failed to load validate.proto:', error.message);
}

console.log('Proto file loading test completed.');
