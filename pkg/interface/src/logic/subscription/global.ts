import BaseSubscription from './base';
import { StoreState } from '../store/type';
import { Path } from '~/types/noun';
import _ from 'lodash';


/**
 * Path to subscribe on and app to subscribe to
 */
type AppSubscription = [Path, string];

const groupSubscriptions: AppSubscription[] = [
  ['/synced', 'contact-hook']
];

const graphSubscriptions: AppSubscription[] = [
  ['/updates', 'graph-store']
];

type AppName = 'groups' | 'graph';
const appSubscriptions: Record<AppName, AppSubscription[]> = {
  groups: groupSubscriptions,
  graph: graphSubscriptions
};

export default class GlobalSubscription extends BaseSubscription<StoreState> {
  openSubscriptions: Record<AppName, number[]> = {
    groups: [],
    graph: []
  };

  start() {
    this.subscribe('/all', 'metadata-store');
    // this.subscribe('/all', 'invite-store');
    this.subscribe('/all', 'launch');
    this.subscribe('/all', 'weather');
    this.subscribe('/groups', 'group-store');
    this.clearQueue();


    this.subscribe('/primary', 'contact-view');
    this.subscribe('/all', 's3-store');
    this.subscribe('/keys', 'graph-store');
    this.subscribe('/updates', 'hark-store');
    this.subscribe('/updates', 'hark-graph-hook');
    this.subscribe('/updates', 'hark-group-hook');
  }

  restart() {
    super.restart();
    _.mapValues(this.openSubscriptions, (subs, app: AppName) => {
      if(subs.length > 0) {
        this.stopApp(app);
        this.startApp(app);
      }
    });
  }

  startApp(app: AppName) {
    if(this.openSubscriptions[app].length > 0) {
      console.log(`${app} already started`);
      return;
    }
    this.openSubscriptions[app] =
      appSubscriptions[app].map(([path, agent]) => this.subscribe(path, agent));
  }

  stopApp(app: AppName) {
    this.openSubscriptions[app].map(id => this.unsubscribe(id))
    this.openSubscriptions[app] = [];
  }
}
