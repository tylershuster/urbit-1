import React, { useCallback, useRef } from 'react';
import _ from 'lodash';
import { Switch, Route, useHistory } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import {
  ManagedTextInputField as Input,
  Box,
  Text,
  Col,
  Row
} from '@tlon/indigo-react';
import { Groups, Rolodex, deSig, Association, resourceFromPath, invite } from '@urbit/api';

import { ShipSearch } from '~/views/components/ShipSearch';
import { AsyncButton } from '~/views/components/AsyncButton';
import { useOutsideClick } from '~/logic/lib/useOutsideClick';
import { FormError } from '~/views/components/FormError';
import GlobalApi from '~/logic/api/global';
import { Workspace } from '~/types/workspace';
import useApi from '~/logic/lib/useApi';

interface InvitePopoverProps {
  baseUrl: string;
  association: Association;
  workspace: Workspace;
}

interface FormSchema {
  emails: string[];
  description: string;
  ships: string[];
}

const formSchema = Yup.object({
  emails: Yup.array(Yup.string().email('Invalid email')),
  ships: Yup.array(Yup.string()).min(1, 'Must invite at least one ship')
});

export function InvitePopover(props: InvitePopoverProps) {
  const { baseUrl, association } = props;
  const api = useApi();

  const relativePath = (p: string) => baseUrl + p;
  const { title } = association?.metadata || '';
  const innerRef = useRef(null);
  const history = useHistory();

  const onOutsideClick = useCallback(() => {
    history.push(props.baseUrl);
  }, [history.push, props.baseUrl]);
  useOutsideClick(innerRef, onOutsideClick);

  const onSubmit = async ({ ships, description }: FormSchema, actions) => {
    //  TODO: how to invite via email?
    try {
      const { ship, name }  = resourceFromPath(association.group);
      await api.thread(invite(
        ship, name,
        _.compact(ships).map(s => `~${deSig(s)}`),
        description
      ));

      actions.setStatus({ success: null });
      onOutsideClick();
    } catch (e) {
      console.error(e);
      actions.setStatus({ error: e.message });
    }
  };

  const initialValues: FormSchema = { ships: [], emails: [], description: '' };

  return (
    <Switch>
      <Route path={[relativePath('/invites')]}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          bg="scales.black30"
          left="0px"
          top="0px"
          width="100vw"
          height="100vh"
          zIndex={4}
          position="fixed"
        >
          <Box
            ref={innerRef}
            border={1}
            borderColor="washedGray"
            borderRadius={1}
            maxHeight="472px"
            width="100%"
            maxWidth="380px"
            mx={[4,0]}
            bg="white"
          >
            <Formik
              initialValues={initialValues}
              onSubmit={onSubmit}
              validationSchema={formSchema}
              validateOnBlur
            >
              <Form>
                <Col gapY="3" pt={3} px={3}>
                  <Box>
                    <Text>Invite to </Text>
                    <Text fontWeight="800">{title}</Text>
                  </Box>
                  <ShipSearch
                    id="ships"
                    label=""
                    autoFocus
                  />
                  <Input
                    id="description"
                    label="Enter a message for the invite"
                  />
                  <FormError message="Failed to invite" />
                  {/* <ChipInput
                    id="emails"
                    label="Invite via Email"
                    caption="Send an Urbit ID and invite them to this group"
                    placeholder="name@example.com"
                    breakOnSpace
                  /> */}
                </Col>
                <Row
                  justifyContent="flex-end"
                  p={3}
                >
                  <AsyncButton
                    border={0}
                    primary
                    loadingText="Inviting..."
                  >
                    Send
                  </AsyncButton>
                </Row>
              </Form>
            </Formik>
          </Box>
        </Box>
      </Route>
    </Switch>
  );
}
