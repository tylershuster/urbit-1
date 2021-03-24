import React, { ReactElement, useRef } from 'react';
import urbitOb from 'urbit-ob';

import { Icon, Row, Box, Text, BaseImage } from '@tlon/indigo-react';
import { Groups, Association, Rolodex } from '@urbit/api';

import { HoverBoxLink } from '~/views/components/HoverBox';
import { Sigil } from '~/logic/lib/sigil';
import { getModuleIcon, getItemTitle, uxToHex } from '~/logic/lib/util';
import { useTutorialModal } from '~/views/components/useTutorialModal';
import { TUTORIAL_HOST, TUTORIAL_GROUP } from '~/logic/lib/tutorialModal';
import { SidebarAppConfigs, SidebarItemStatus } from './types';
import { Workspace } from '~/types/workspace';
import useContactState from '~/logic/state/contact';
import useGroupState from '~/logic/state/group';
import useSettingsState, { selectCalmState } from '~/logic/state/settings';
import Dot from '~/views/components/Dot';


function SidebarItemIndicator(props: { status?: SidebarItemStatus }) {
  switch (props.status) {
    case 'disconnected':
      return <Icon ml={2} fill="red" icon="X" />;
    case 'unsubscribed':
      return <Icon ml={2} icon="Circle" fill="gray" />;
    case 'mention':
      return <Icon ml={2} icon="Circle" />;
    case 'loading':
      return <Icon ml={2} icon="Bullet" />;
    default:
      return null;
  }
}

// eslint-disable-next-line max-lines-per-function
export function SidebarItem(props: {
  hideUnjoined: boolean;
  association: Association;
  path: string;
  selected: boolean;
  apps: SidebarAppConfigs;
  workspace: Workspace;
}): ReactElement | null {
  const { association, path, selected, apps } = props;
  let title = getItemTitle(association) || '';
  const appName = association?.['app-name'];
  const mod = association?.metadata?.module || appName;
  const rid = association?.resource;
  const groupPath = association?.group;
  const groups = useGroupState(state => state.groups);
  const anchorRef = useRef<HTMLElement | null>(null);
  const { hideAvatars, hideNicknames } = useSettingsState(selectCalmState);
  const contacts = useContactState(state => state.contacts);
  useTutorialModal(
    mod as any,
    groupPath === `/ship/${TUTORIAL_HOST}/${TUTORIAL_GROUP}`,
    anchorRef
  );
  const app = apps[appName];
  const isUnmanaged = groups?.[groupPath]?.hidden || false;
  if (!app) {
    return null;
  }
  const DM = (isUnmanaged && props.workspace?.type === 'messages');

  const itemStatus = app.getStatus(path);

  const hasNotification = itemStatus === 'notification';

  const hasUnread = itemStatus === 'unread';

  const isSynced = itemStatus !== 'unsubscribed';

  let baseUrl = `/~landscape${groupPath}`;

  if (DM) {
    baseUrl = '/~landscape/messages';
  } else if (isUnmanaged) {
    baseUrl = '/~landscape/home';
  }

  const to = isSynced
    ? `${baseUrl}/resource/${mod}${rid}`
    : `${baseUrl}/join/${mod}${rid}`;

  let color = 'lightGray';

  if (isSynced) {
    if (hasUnread || hasNotification) {
      color = 'black';
    } else {
      color = 'gray';
    }
  }

  const fontWeight = (hasUnread || hasNotification) ? '500' : 'normal';

  if (props.hideUnjoined && !isSynced) {
    return null;
  }

  let img = null;

  if (urbitOb.isValidPatp(title)) {
    if (contacts?.[title]?.avatar && !hideAvatars) {
      img = <BaseImage referrerPolicy="no-referrer" src={contacts[title].avatar} width='16px' height='16px' borderRadius={2} />;
    } else {
      img = <Sigil ship={title} color={`#${uxToHex(contacts?.[title]?.color || '0x0')}`} icon padding={2} size={16} />;
    }
    if (contacts?.[title]?.nickname && !hideNicknames) {
      title = contacts[title].nickname;
    }
  } else {
    img = <Box flexShrink={0} height={16} width={16} borderRadius={2} backgroundColor={`#${uxToHex(props?.association?.metadata?.color)}` || '#000000'} />;
  }

  return (
    <HoverBoxLink
      ref={anchorRef}
      to={to}
      bg="white"
      bgActive="washedGray"
      width="100%"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      py={1}
      pl={3}
      pr={3}
      selected={selected}
    >
      <Row width='100%' alignItems="center" flex='1 auto' minWidth='0'>
        {hasNotification && <Text color='black' marginLeft={-2} width={2} display='flex' alignItems='center'>
          <Dot />
        </Text>}
        {DM ? img : (
              <Icon
                display="block"
                color={isSynced ? 'black' : 'gray'}
                icon={getModuleIcon(mod) as any}
              />
            )
        }
        <Box width='100%' flexShrink={2} ml={2} display='flex' overflow='hidden'>
          <Text
            lineHeight="tall"
            display='inline-block'
            flex='1'
            overflow='hidden'
            width='100%'
            mono={urbitOb.isValidPatp(title)}
            color={color}
            fontWeight={fontWeight}
            style={{ textOverflow: 'ellipsis', whiteSpace: 'pre' }}
          >
            {title}
          </Text>
        </Box>
      </Row>
    </HoverBoxLink>
  );
}
