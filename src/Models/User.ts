import {Activity} from './Activity';

export interface User {
  id?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  height?: number;
  weight?: number;
  gender?: 'Male' | 'Female';
  oneDayMaxSteps?: number;
  oldActivites?: Activity[];
  liveActivity?: Activity;
  topActivity?: Activity;
  lastFourDaysSteps?: number[];
}
