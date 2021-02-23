import React, {
  useRef
} from 'react';
import { useHistory } from 'react-router-dom';

import {
  Col,
  Row,
  Box,
  Text,
  Icon,
  Button,
  BaseImage
} from '@tlon/indigo-react';
import { uxToHex } from "@urbit/api";

import ReconnectButton from './ReconnectButton';
import { Dropdown } from './Dropdown';
import { StatusBarItem } from './StatusBarItem';
import { Sigil } from '~/logic/lib/Sigil';
import { SetStatusBarModal } from './SetStatusBarModal';
import { useTutorialModal } from './useTutorialModal';
import useLocalState from '~/logic/state/local';
import useInviteState from '~/logic/state/invite';
import useHarkState from '~/logic/state/hark';


const StatusBar = (props) => {
  const { ourContact, ship } = props;
  const invites = useInviteState(state => state.invites);
  const metaKey = (window.navigator.platform.includes('Mac')) ? '⌘' : 'Ctrl+';
  const history = useHistory();
  const { toggleOmnibox, hideAvatars } =
    useLocalState(({ toggleOmnibox, hideAvatars }) =>
      ({ toggleOmnibox, hideAvatars })
    );

  const color = !!ourContact ? `#${uxToHex(props.ourContact.color)}` : '#000';
  const xPadding = (!hideAvatars && ourContact?.avatar) ? '0' : '2';
  const bgColor = (!hideAvatars && ourContact?.avatar) ? '' : color;
  const profileImage = (!hideAvatars && ourContact?.avatar) ? (
    <BaseImage
      src={ourContact.avatar}
      borderRadius={2}
      width='32px'
      height='32px'
      style={{ objectFit: 'cover' }} />
  ) : <Sigil ship={ship} size={16} color={color} icon />;

  const anchorRef = useRef(null);

  const leapHighlight = useTutorialModal('leap', true, anchorRef.current);

  const floatLeap = leapHighlight && window.matchMedia('(max-width: 550px)').matches;

  const doNotDisturb = useHarkState(state => state.doNotDisturb);
  const notificationsCount = useHarkState(state => state.notificationsCount);

  return (
    <Box
      display='grid'
      width="100%"
      gridTemplateRows="30px"
      gridTemplateColumns="3fr 1fr"
      py='3'
      px='3'
      pb='3'
      >
      <Row collapse>
      <Button width="32px" borderColor='washedGray' mr='2' px='2' onClick={() => history.push('/')} {...props}>
        <Icon icon='Spaces' color='black'/>
      </Button>
        <StatusBarItem float={floatLeap} mr={2} onClick={() => toggleOmnibox()}>
        { !doNotDisturb && (notificationsCount > 0 || invites.length > 0) &&
          (<Box display="block" right="-8px" top="-8px" position="absolute" >
            <Icon color="blue" icon="Bullet" />
           </Box>
        )}
        <Icon icon='LeapArrow'/>
          <Text ref={anchorRef} ml={2} color='black'>
            Leap
          </Text>
          <Text display={['none', 'inline']} ml={2} color='gray'>
            {metaKey}/
          </Text>
        </StatusBarItem>
        <ReconnectButton
          connection={props.connection}
        />
      </Row>
      <Row justifyContent="flex-end" collapse>
        <StatusBarItem
          mr='2'
          backgroundColor='yellow'
          display={process.env.LANDSCAPE_STREAM === 'development' ? 'flex' : 'none'}
          justifyContent="flex-end"
          flexShrink={0}
          onClick={() => window.open(
            'https://github.com/urbit/landscape/issues/new' +
            '?assignees=&labels=development-stream&title=&' +
            `body=commit:%20urbit/urbit@${process.env.LANDSCAPE_SHORTHASH}`
            )}
          >
          <Text color='#000000'>Submit <Text color='#000000' display={['none', 'inline']}>an</Text> issue</Text>
        </StatusBarItem>
        <StatusBarItem width="32px" mr={2} onClick={() => history.push('/~landscape/messages')}>
            <Icon icon="Users"/>
        </StatusBarItem>
        <Dropdown
          dropWidth="150px"
          width="auto"
          alignY="top"
          alignX="right"
          flexShrink={0}
          options={
            <Col
              mt='6'
              p='1'
              backgroundColor="white"
              color="washedGray"
              border={1}
              borderRadius={2}
              borderColor="lightGray"
              boxShadow="0px 0px 0px 3px">
              <Row
                p={1}
                color='black'
                cursor='pointer'
                fontSize={1}
                onClick={() => history.push(`/~profile/~${ship}`)}>
                View Profile
              </Row>
              <SetStatusBarModal
                ship={`~${ship}`}
                contact={ourContact}
                ml='1'
              />
              <Row
                p={1}
                color='black'
                cursor='pointer'
                fontSize={1}
                onClick={() => history.push('/~settings')}>
                System Settings
              </Row>
            </Col>
          }>
          <StatusBarItem
            px={xPadding}
            width="32px"
            flexShrink={0}
            backgroundColor={bgColor}>
            {profileImage}
          </StatusBarItem>
        </Dropdown>
      </Row>
    </Box>
  );
};

export default StatusBar;
