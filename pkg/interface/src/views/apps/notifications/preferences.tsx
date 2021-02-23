import React, { ReactElement, useCallback } from 'react';
import { Form, FormikHelpers } from 'formik';
import _ from 'lodash';

import { Col, ManagedCheckboxField as Checkbox } from '@tlon/indigo-react';
import { NotificationGraphConfig, setDoNotDisturb, setMentions, setWatchOnSelf } from '@urbit/api';

import { FormikOnBlur } from '~/views/components/FormikOnBlur';
import useHarkState from '~/logic/state/hark';
import useApi from '~/logic/lib/useApi';

interface FormSchema {
  mentions: boolean;
  dnd: boolean;
  watchOnSelf: boolean;
  watching: string[];
}

interface NotificationPreferencesProps {
  graphConfig: NotificationGraphConfig;
}

export default function NotificationPreferences(
  props: NotificationPreferencesProps
): ReactElement {
  const { graphConfig } = props;
  const dnd = useHarkState(state => state.doNotDisturb);
  const api = useApi();

  const initialValues: FormSchema = {
    mentions: graphConfig.mentions,
    watchOnSelf: graphConfig.watchOnSelf,
    dnd,
    watching: graphConfig.watching
  };

  const onSubmit = useCallback(
    async (values: FormSchema, actions: FormikHelpers<FormSchema>) => {
      console.log(values);
      try {
        const promises: Promise<any>[] = [];
        if (values.mentions !== graphConfig.mentions) {
          promises.push(api.poke(setMentions(values.mentions)));
        }
        if (values.watchOnSelf !== graphConfig.watchOnSelf) {
          promises.push(api.poke(setWatchOnSelf(values.watchOnSelf)));
        }
        if (values.dnd !== dnd && !_.isUndefined(values.dnd)) {
          promises.push(api.poke(setDoNotDisturb(values.dnd)));
        }

        await Promise.all(promises);
        actions.setStatus({ success: null });
        actions.resetForm({ values: initialValues });
      } catch (e) {
        console.error(e);
        actions.setStatus({ error: e.message });
      }
    },
    [graphConfig]
  );

  return (
    <FormikOnBlur
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      <Form>
        <Col maxWidth="384px" p="3" gapY="4">
          <Checkbox
            label="Do not disturb"
            id="dnd"
            caption="You won't see the notification badge, but notifications will still appear in your inbox."
          />
          <Checkbox
            label="Watch for replies"
            id="watchOnSelf"
            caption="Automatically follow a post for notifications when it's yours"
          />
          <Checkbox
            label="Watch for mentions"
            id="mentions"
            caption="Notify me if someone mentions my @p in a channel I've joined"
          />
        </Col>
      </Form>
    </FormikOnBlur>
  );
}
