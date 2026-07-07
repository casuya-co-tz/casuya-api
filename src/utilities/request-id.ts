import { v4 as uuidv4 } from 'uuid';

let requestIdCounter = 0;

export function generateRequestId(): string {
  requestIdCounter++;
  const timestamp = Date.now().toString(36);
  const counter = requestIdCounter.toString(36).padStart(4, '0');
  return `req_${timestamp}_${counter}`;
}

export function generateUuid(): string {
  return uuidv4();
}
