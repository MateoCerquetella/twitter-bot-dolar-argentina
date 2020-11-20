import schedule from 'node-schedule';

export interface ScheduleRule {
  days: [schedule.Range];
  hours: Array<number>;
  minute: number;
}
