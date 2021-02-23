import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';

import { Button, LoadingSpinner } from '@tlon/indigo-react';

export function AsyncButton<T = any>({
  children,
  onSuccess = () => {},
  ...rest
}: Parameters<typeof Button>[0]) {
  const { isSubmitting, status, isValid, setStatus } = useFormikContext<T>();
  const [success, setSuccess] = useState<boolean | undefined>();

  useEffect(() => {
    const s = status || {};
    let done = false;
    if ('success' in s) {
      setSuccess(true);
      onSuccess();
      done = true;
    } else if ('error' in s) {
      setSuccess(false);
      done = true;
    }
    if (done) {
      setTimeout(() => {
        setSuccess(undefined);
      }, 1500);
      done = false;
    }
  }, [status]);

  return (
    <Button
      hideDisabled={isSubmitting}
      disabled={!isValid || isSubmitting}
      type="submit"
      {...rest}
    >
      {isSubmitting ? (
        <LoadingSpinner
          foreground={rest.primary ? 'white' : 'black'}
          background="gray"
        />
      ) : success === true ? (
        'Done'
      ) : success === false ? (
        'Errored'
      ) : (
        children
      )}
    </Button>
  );
}
