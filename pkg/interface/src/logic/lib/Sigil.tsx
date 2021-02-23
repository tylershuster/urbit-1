import React, { memo } from 'react';

import { sigil, reactRenderer } from '@tlon/sigil-js';
import { Box } from '@tlon/indigo-react';

export const foregroundFromBackground = (background: string): 'black' | 'white' => {
  const rgb = {
    r: parseInt(background.slice(1, 3), 16),
    g: parseInt(background.slice(3, 5), 16),
    b: parseInt(background.slice(5, 7), 16)
  };
  const brightness = (299 * rgb.r + 587 * rgb.g + 114 * rgb.b) / 1000;
  const whiteBrightness = 255;

  return whiteBrightness - brightness < 50 ? 'black' : 'white';
};

interface SigilProps {
  classes?: string;
  color: string;
  foreground?: string;
  ship: string;
  size: number;
  svgClass?: string;
  icon?: boolean;
  padding?: number;
};

export const Sigil = memo(
  (props: SigilProps) => {
    const {
      classes = '',
      color,
      foreground = '',
      ship,
      size,
      svgClass = '',
      icon = false,
      padding = 0
    } = props;
    const innerSize = Number(size) - 2*padding;
    const paddingPx = `${padding}px`;
    const foregroundColor = foreground
      ? foreground
      : foregroundFromBackground(color);
    return ship.length > 14 ? (
      <Box
        backgroundColor={color}
        borderRadius={icon ? '1' : '0'}
        display='inline-block'
        height={size}
        width={size}
        className={classes}
      />
    ) : (
      <Box
        display='inline-block'
        borderRadius={icon ? '1' : '0'}
        flexBasis={size}
        backgroundColor={color}
        padding={paddingPx}
        className={classes}
      >
        {sigil({
          patp: ship,
          renderer: reactRenderer,
          size: innerSize,
          icon,
          colors: [color, foregroundColor],
          class: svgClass
        })}
      </Box>
    );
  }
);

Sigil.displayName = 'Sigil';

export default Sigil;
