import React, { ReactElement, useCallback } from 'react';
import _ from 'lodash';

import { Col } from '@tlon/indigo-react';
import {
  Associations,
  GroupNotificationContents,
  GroupNotifIndex,
  GroupUpdate,
  hark,
  Rolodex
} from '@urbit/api';

import { Header } from './header';
import useApi from '~/logic/api';

function describeNotification(description: string, plural: boolean) {
  switch (description) {
    case 'add-members':
      return 'joined';
    case 'remove-members':
      return 'left';
    default:
      return description;
  }
}

function getGroupUpdateParticipants(update: GroupUpdate): string[] {
  if ('addMembers' in update) {
    return update.addMembers.ships;
  }
  if ('removeMembers' in update) {
    return update.removeMembers.ships;
  }
  return [];
}

interface GroupNotificationProps {
  index: GroupNotifIndex;
  contents: GroupNotificationContents;
  archived: boolean;
  read: boolean;
  time: number;
  timebox: BigInteger;
}

export function GroupNotification(props: GroupNotificationProps): ReactElement {
  const { contents, index, read, time, timebox } = props;
  const api = useApi();

  const authors = _.flatten(_.map(contents, getGroupUpdateParticipants));

  const { group } = index;
  const desc = describeNotification(index.description, contents.length !== 1);

  const onClick = useCallback(() => {
    if (props.archived) {
      return;
    }
    const func = read ? 'unread' : 'read';
    return api.poke(hark[func](timebox, { group: index }));
  }, [api, timebox, index, read]);

  return (
    <Col onClick={onClick} p="2">
      <Header
        archived={props.archived}
        time={time}
        read={read}
        group={group}
        authors={authors}
        description={desc}
      />
    </Col>
  );
}

