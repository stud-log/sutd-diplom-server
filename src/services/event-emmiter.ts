import EventEmitter from "events";

export type StudLogEvents = 'achievementReceived' | 'log';

class StudLogEventEmitter {
  private static instance: StudLogEventEmitter;
  private eventEmitter: EventEmitter;
  
  private constructor() {
    this.eventEmitter = new EventEmitter();
  }
  
  public static getInstance(): StudLogEventEmitter {
    if (!StudLogEventEmitter.instance) {
      StudLogEventEmitter.instance = new StudLogEventEmitter();
    }
  
    return StudLogEventEmitter.instance;
  }
  
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }

  subscribe(event: StudLogEvents, cb: (userId: number, data: any) => void) {
    return this.eventEmitter.once(event, cb);
  }

  publish(event: StudLogEvents, userId: number, data: any) {
    return this.eventEmitter.emit(event, userId, data);
  }
}

export default StudLogEventEmitter.getInstance();