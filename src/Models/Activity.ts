export interface UserCoordinate {
  lat?: number;
  long?: number;
}

export interface SubActivity {
  startTime?: string;
  endTime?: string;
  duration?: string;
  length?: string;
  averageSpeed?: string;
  coordinates?: UserCoordinate[];
}

export interface Activity {
  id?: string;
  lob?: 'self' | 'group';
  type?: 'indoor' | 'outdoor';
  subType?: 'running' | 'cycling' | 'trek' | 'walking';
  date?: string;
  isLive?: boolean;
  activityDetails?: SubActivity;
  currentlyGoingOn?: boolean;
}
