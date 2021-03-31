import Notification from './notification';
import RethinkdbNotificationAdapter from './rethinkdb';

export default RethinkdbNotificationAdapter as InstanceType<
  typeof Notification
>;
