import { v4 as uuidv4 } from 'uuid';
import { IWebSocketContract, IWebSocketEvent } from '../interfaces';
import { ContractOptions } from './types';

export class WebSocketContract implements IWebSocketContract {
  id: string;
  name: string;
  version: string;
  description: string;
  tags: string[];
  deprecated: boolean;
  createdAt: Date;
  updatedAt: Date;
  events: IWebSocketEvent[];
  channels: string[];

  constructor(options: ContractOptions) {
    this.id = uuidv4();
    this.name = options.name;
    this.version = options.version;
    this.description = options.description;
    this.tags = options.tags || [];
    this.deprecated = options.deprecated || false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.events = [];
    this.channels = [];
  }

  addEvent(event: IWebSocketEvent): WebSocketContract {
    this.events.push(event);
    this.updatedAt = new Date();
    return this;
  }

  addChannel(channel: string): WebSocketContract {
    if (!this.channels.includes(channel)) {
      this.channels.push(channel);
    }
    this.updatedAt = new Date();
    return this;
  }

  removeChannel(channel: string): WebSocketContract {
    this.channels = this.channels.filter(c => c !== channel);
    this.updatedAt = new Date();
    return this;
  }
}
