import React, { ReactElement, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import {
  Center,
  Box,
  Row,
  BaseImage,
  Text
} from "@tlon/indigo-react";
import { uxToHex, retrieve } from '@urbit/api';

import RichText from '~/views/components/RichText'
import useLocalState from "~/logic/state/local";
import { Sigil } from '~/logic/lib/Sigil';
import { ViewProfile } from './ViewProfile';
import { EditProfile } from './EditProfile';
import { SetStatusBarModal } from '~/views/components/SetStatusBarModal';
import { useTutorialModal } from '~/views/components/useTutorialModal';
import useApi from '~/logic/lib/useApi';

export function Profile(props: any): ReactElement | null {
  const { hideAvatars } = useLocalState(({ hideAvatars }) => ({
    hideAvatars
  }));
  const history = useHistory();

  if (!props.ship) {
    return null;
  }
  const { contact, nackedContacts, hasLoaded, isPublic, isEdit, ship } = props;
  const nacked = nackedContacts.has(ship);
  const api = useApi();

  useEffect(() => {
    if (hasLoaded && !contact && !nacked) {
      api.poke(retrieve(ship));
    }
  }, [hasLoaded, contact]);

  const hexColor = contact?.color ? `#${uxToHex(contact.color)}` : '#000000';
  const cover = (contact?.cover)
    ? <BaseImage src={contact.cover} width='100%' height='100%' style={{ objectFit: 'cover' }} />
    : <Box display="block" width='100%' height='100%' backgroundColor='washedGray' />;

  const image = (!hideAvatars && contact?.avatar)
    ? <BaseImage src={contact.avatar} width='100%' height='100%' style={{ objectFit: 'cover' }} />
    : <Sigil padding={24} ship={ship} size={128} color={hexColor} />;

  const anchorRef = useRef<HTMLElement | null>(null);

  useTutorialModal('profile', ship === `~${window.ship}`, anchorRef.current);

  return (
    <Center
      p={[0,4]}
      height="100%"
      width="100%"
    >

      <Box
        ref={anchorRef}
        maxWidth="600px"
        width="100%"
      >
        <Row alignItems="center" justifyContent="space-between">
          <Row>
          {ship === `~${window.ship}` ? (
            <>
            <Text
              py='2'
              cursor='pointer'
              onClick={() => {
 history.push(`/~profile/${ship}/edit`);
}}
            >
              Edit Profile
            </Text>
              <SetStatusBarModal
                py='2'
                ml='3'
                ship={`~${window.ship}`}
                contact={contact}
              />
              </>
          ) : null}
          </Row>
          <RichText mb='0' py='2' disableRemoteContent maxWidth='18rem' overflowX='hidden' textOverflow="ellipsis"
            whiteSpace="nowrap"
            overflow="hidden" display="inline-block" verticalAlign="middle">{contact?.status ?? ""}</RichText>
        </Row>
        <Row  width="100%" height="300px">
          {cover}
        </Row>
        <Row
          pb={2}
          alignItems="center"
          width="100%"
        >
          <Center width="100%" marginTop="-48px">
            <Box height='128px' width='128px' borderRadius="2" overflow="hidden">
              {image}
            </Box>
          </Center>
        </Row>
        { isEdit ? (
          <EditProfile
            ship={ship}
            contact={contact}
            s3={props.s3}
            isPublic={isPublic}
          />
        ) : (
          <ViewProfile
            nacked={nacked}
            ship={ship}
            contact={contact}
            isPublic={isPublic}
          />
        ) }
      </Box>
    </Center>
  );
}
