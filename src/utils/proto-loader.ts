import { loadSync } from '@grpc/proto-loader';
import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import * as path from 'path';
import { PROTO_DIR } from './protos';

export function loadProto(protoPath: string, packageName: string, serviceName: string) {
  const packageDefinition = loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const protoDescriptor = loadPackageDefinition(packageDefinition);
  return protoDescriptor[packageName][serviceName];
}



// Log the paths to verify they're correct
console.log('Proto directory:', PROTO_DIR);
