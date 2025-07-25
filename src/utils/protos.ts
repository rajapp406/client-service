import path from "path";

// Define proto file paths relative to the project root
export const PROTO_DIR = path.join(process.cwd(), 'node_modules', '@rajapp406', 'proto-definitions', 'protos');
export const authProto = path.join(PROTO_DIR, 'auth.proto');
export const checkProto = path.join(PROTO_DIR, 'check.proto');
export const clientProto = path.join(PROTO_DIR, 'client.proto');
export const customerProto = path.join(PROTO_DIR, 'customer.proto');
export const validateProto = path.join(PROTO_DIR, 'validate.proto');