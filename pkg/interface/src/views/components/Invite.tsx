import React, { Component } from 'react';
import { Invite } from '@urbit/api/invite/types';
import { Text, Box, Button, Row, Rule } from '@tlon/indigo-react';
import { StatelessAsyncAction } from "~/views/components/StatelessAsyncAction";
import { cite } from '~/logic/lib/util';

export class InviteItem extends Component<{invite: Invite, onAccept: (i: any) => Promise<any>, onDecline: (i: any) => Promise<any>}, {}> {
  render() {
    const { props } = this;

    return (
      <>
      <Box width='100%' p='4'>
        <Box width='100%' verticalAlign='middle'>
          <Text display='block' pb='2' gray><Text mono>{cite(props.invite.resource.ship)}</Text> invited you to <Text fontWeight='500'>{props.invite.resource.name}</Text></Text>
        </Box>
        <Row>
          <StatelessAsyncAction 
            name="accept"
            bg="transparent"
            onClick={() => props.onAccept(props.invite)}
            color='blue'
            mr='2'
          >
            Accept
          </StatelessAsyncAction>
          <StatelessAsyncAction
            name="decline"
            bg="transparent"
            color='red'
            onClick={() => props.onDecline(props.invite)}
          >
              Reject
            </StatelessAsyncAction>

        </Row>
      </Box>
      <Rule />
      </>
    );
  }
}

export default InviteItem;
