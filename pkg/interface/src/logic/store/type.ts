import { Path } from '~/types/noun';
import { Invites } from '@urbit/api/invite';
import { Associations } from '~/types/metadata-update';
import { Rolodex } from '~/types/contact-update';
import { Groups } from '~/types/group-update';
import { S3State } from '~/types/s3-update';
import { LaunchState, WeatherState } from '~/types/launch-update';
import { ConnectionStatus } from '~/types/connection';
import {Graphs} from '~/types/graph-update';
import {
  Notifications,
  NotificationGraphConfig, 
  GroupNotificationsConfig,
  Unreads
} from "~/types";

export interface StoreState {
  // local state
  connection: ConnectionStatus;
  baseHash: string | null;

  // metadata state
  associations: Associations;
  // contact state
  contacts: Rolodex;
  // groups state
  groups: Groups;
  groupKeys: Set<Path>;
  s3: S3State;
  graphs: Graphs;
  graphKeys: Set<string>;


  // App specific states
  //  launch state
  launch: LaunchState;
  weather: WeatherState | {} | null;
  userLocation: string | null;

  archivedNotifications: Notifications;
  notifications: Notifications;
  notificationsGraphConfig: NotificationGraphConfig;
  notificationsGroupConfig: GroupNotificationsConfig;
  notificationsCount: number,
  unreads: Unreads;
  doNotDisturb: boolean;
  unreads: Unreads;
}
