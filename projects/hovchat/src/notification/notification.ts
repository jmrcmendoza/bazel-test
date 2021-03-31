import { TypedEmitter } from 'tiny-typed-emitter';

import { NotificationEvents } from 'src/types/notification';

export default class Notification extends TypedEmitter<NotificationEvents> {}
