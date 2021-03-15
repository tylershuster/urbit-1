import React, { ReactElement } from 'react';
import _ from 'lodash';

import { Col } from '@tlon/indigo-react';
import { Invites as IInvites, Associations, Invite, JoinRequests, Groups, Contacts, AppInvites, JoinProgress } from '@urbit/api';

import GlobalApi from '~/logic/api-old/global';
import { resourceAsPath, alphabeticalOrder } from '~/logic/lib/util';
import InviteItem from '~/views/components/Invite';
import useInviteState from '~/logic/state/invite';
import useGroupState from '~/logic/state/group';

interface InviteRef {
  uid: string;
  app: string
  invite: Invite;
}

export function Invites(): ReactElement {
  const pendingJoin = useGroupState(state => state.pendingJoin);
  const invites = useInviteState(state => state.invites);

  const inviteArr: InviteRef[] = _.reduce(invites, (acc: InviteRef[], val: AppInvites, app: string) => {
    const appInvites = _.reduce(val, (invs: InviteRef[], invite: Invite, uid: string) => {
      return [...invs, { invite, uid, app }];
    }, []);
    return [...acc, ...appInvites];
  }, []);

  const invitesAndStatus: { [rid: string]: JoinProgress | InviteRef } =
    { ..._.keyBy(inviteArr, ({ invite }) => resourceAsPath(invite.resource)), ...props.pendingJoin };

  return (
    <Col
      zIndex={4}
      gapY={2}
      bg="white"
      top="0px"
      position="sticky"
      flexShrink={0}
    >
     { Object
         .keys(invitesAndStatus)
         .sort(alphabeticalOrder)
         .map((resource) => {
           const inviteOrStatus = invitesAndStatus[resource];
          if(typeof inviteOrStatus === 'string') {
           return (
             <InviteItem
               key={resource}
               resource={resource}
               
             />
          );
        } else {
          const { app, uid, invite } = inviteOrStatus;
          console.log(inviteOrStatus);
          return (
            <InviteItem
              key={resource}
              invite={invite}
              app={app}
              uid={uid}
              resource={resource}
            />
            );
        }
     })}
    </Col>
  );
}
