import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

export const PROTO_DIR = join(process.cwd(), 'node_modules', '@rajapp406', 'proto-definitions', 'protos');
export const clientProto = join(PROTO_DIR, 'client.proto');
const packageDefinition = protoLoader.loadSync(clientProto, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const validateProto = grpc.loadPackageDefinition(packageDefinition).client as any;

const client = new validateProto.ClientService(
  'localhost:50522',
  grpc.credentials.createInsecure(),
);

function fetchUser(userId: string) {
  return new Promise((resolve, reject) => {
    client.fetchUser({ userId }, (error: any, response: any) => {
      if (error) {
        console.error('Error:', error);
        reject(error);
      } else {
        console.log('Response:', response);
        resolve(response);
      }
    });
  });
}

// Test the service
async function test() {
  try {
    console.log('Calling fetchUser with userId: test123');
    await fetchUser('61eb3e6c-4d44-47cf-bfe2-53cb16973579');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
