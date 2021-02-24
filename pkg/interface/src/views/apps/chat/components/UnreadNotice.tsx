import React from 'react';
import moment from 'moment';

import { Box, Text } from '@tlon/indigo-react';

import Timestamp from '~/views/components/Timestamp';

export const UnreadNotice = (props) => {
  const { unreadCount, unreadMsg, dismissUnread, onClick } = props;

  if (!unreadMsg || (unreadCount === 0)) {
    return null;
  }
  
  const stamp = moment.unix(unreadMsg.post['time-sent'] / 1000);

  return (
    <Box style={{ left: '0px', top: '0px' }}
      p='4'
      width='100%'
      position='absolute'
      zIndex={1}
      className='unread-notice'
    >
      <Box
        backgroundColor='white'
        display='flex'
        alignItems='center'
        p='2'
        fontSize='0'
        justifyContent='space-between'
        borderRadius='1'
        border='1'
        borderColor='blue'>
        <Text flexShrink={1} textOverflow='ellipsis' whiteSpace='pre' overflow='hidden' display='block' cursor='pointer' onClick={onClick}>
          {unreadCount} new message{unreadCount > 1 ? 's' : ''} since{' '}
          <Timestamp stamp={stamp} color='blue' date={true} fontSize={1} />
        </Text>
        <Text
          ml='4'
          color='blue'
          cursor='pointer'
          textAlign='right'
          flexShrink={0}
          onClick={dismissUnread}>
          Mark as Read
        </Text>
      </Box>
    </Box>
  );
}
