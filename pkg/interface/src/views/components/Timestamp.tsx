import moment, { Moment as MomentType } from 'moment';
import React, { ReactElement } from 'react';

import { Box, BoxProps, Text } from '@tlon/indigo-react';
import { useHovering } from '~/logic/lib/util';

export const DateFormat = 'YYYY.M.D';
export const TimeFormat = 'HH:mm';

export type TimestampProps = BoxProps & {
  stamp: MomentType;
  date?: boolean;
  time?: boolean;
}

const Timestamp = (props: TimestampProps): ReactElement | null=> {
  const { stamp, date, time, color, fontSize, ...rest } = {
    time: true, color: 'gray', fontSize: 0, ...props
  };
  if (!stamp) return null;
  const { hovering, bind } = date === true
    ? { hovering: true, bind: {} }
    : useHovering();
  let datestamp = stamp.format(DateFormat);
  if (stamp.format(DateFormat) === moment().format(DateFormat)) {
    datestamp = 'Today';
  } else if (stamp.format(DateFormat) === moment().subtract(1, 'day').format(DateFormat)) {
    datestamp = 'Yesterday';
  }
  const timestamp = stamp.format(TimeFormat);
  return (
    <Box
      {...bind}
      display='flex'
      flex='row'
      flexWrap="nowrap"
      {...rest}
      title={stamp.format(DateFormat + ' ' + TimeFormat)}
    >
      {time && <Text flexShrink={0} color={color} fontSize={fontSize}>{timestamp}</Text>}
      {date !== false && <Text
        flexShrink={0}
        color={color}
        fontSize={fontSize}
        ml={time ? 2 : 0}
        display={time ? ['none', hovering ? 'block' : 'none'] : 'block'}
      >
        {datestamp}
      </Text>}
    </Box>
  )
}

export default Timestamp;