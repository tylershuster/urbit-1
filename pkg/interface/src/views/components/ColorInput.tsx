import React, { FormEvent, ReactElement } from 'react';
import { useField } from 'formik';

import {
  Col,
  Label,
  Row,
  Box,
  ErrorLabel,
  StatelessTextInput as Input
} from '@tlon/indigo-react';
import { hexToUx } from '@urbit/api';


type ColorInputProps = Parameters<typeof Col>[0] & {
  id: string;
  label: string;
  disabled?: boolean;
};

export function ColorInput(props: ColorInputProps): ReactElement {
  const { id, label, caption, disabled, ...rest } = props;
  const [{ value, onBlur }, meta, { setValue }] = useField(id);

  const hex = value.replace('#', '').replace('0x','').replace('.', '');
  const padded = hex.padStart(6, '0');

  const onChange = (e: FormEvent<HTMLInputElement>) => {
    let { value: newValue } = e.target as HTMLInputElement;
    newValue = newValue.replace('#', '');
    const valid = newValue.match(/^(\d|[a-f]|[A-F]){0,6}$/);

    if (!valid) {
      return;
    }
    const result = hexToUx(newValue);
    setValue(result);
  };

  return (
    <Box display="flex" flexDirection="column" {...rest}>
      <Label htmlFor={id}>{label}</Label>
      {caption ? (
        <Label mt="2" gray>
          {caption}
        </Label>
      ) : null}
      <Row mt="2" alignItems="flex-end">
        <Input
          borderTopRightRadius={0}
          borderBottomRightRadius={0}
          onBlur={onBlur}
          onChange={onChange}
          value={hex}
          disabled={disabled || false}
          borderRight={0}
        />
        <Box
          borderBottomRightRadius={1}
          borderTopRightRadius={1}
          border={1}
          borderLeft={0}
          borderColor="lightGray"
          width="32px"
          alignSelf="stretch"
          bg={`#${padded}`}
        >
          <Input
            width="100%"
            height="100%"
            alignSelf="stretch"
            onInput={onChange}
            value={`#${padded}`}
            disabled={disabled || false}
            type="color"
            opacity={0}
            overflow="hidden"
          />
        </Box>
      </Row>
      <ErrorLabel mt="2" hasError={Boolean(meta.touched && meta.error)}>
        {meta.error}
      </ErrorLabel>
    </Box>
  );
}
