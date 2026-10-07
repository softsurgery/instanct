import { STORAGE_SYSTEMATICS } from './app/constants/storage-systematics.constants';
import { ConfigurationNamespaces } from './app/enums/configuration-namespaces.enum';
import { EventType } from './app/enums/event-type.enum';
import { NotificationType } from './app/enums/notification-type.enum';
import { SessionType } from './app/enums/session.enum';
import { StaticMessageEnum } from './app/enums/static-message.enum';
import { bindStaticMessage } from 'nsa-chat/enums/static-message.registry';
import { bindConfigurationNamespaces } from 'nsa-configurations/enums/configuration-namespaces.registry';
import { bindEventType } from 'nsa-logger/enums/event-type.registry';
import { bindNotificationType } from 'nsa-notifications/enums/notification-type.registry';
import { bindSessionType } from 'nsa-sessions/enums/session-type.registry';
import { bindStorageSystematics } from 'nsa-storage/constants/storage-systematics.registry';

bindEventType(EventType);
bindNotificationType(NotificationType);
bindStaticMessage(StaticMessageEnum);
bindSessionType(SessionType);
bindConfigurationNamespaces(ConfigurationNamespaces);
bindStorageSystematics(STORAGE_SYSTEMATICS);
