import React  from 'react';
import { Text, Icon } from '@tlon/indigo-react';

import Tile from './tile';

const BasicTile = (props) => {
  return (
    <Tile
      bg={props.title === 'Terminal' ? '#000000' : 'white'}
      to={props.linkedUrl}
    >
      <Text color={props.title === 'Terminal' ? '#ffffff' : 'black'}>
        {props.title === 'Terminal'
          ? <Icon
            icon='ChevronEast'
            color='#fff'
            size='12px'
            display='inline-block'
            verticalAlign='top'
            mt='5px'
            mr='2'
            />
          : null
        }{props.title}
      </Text>
    </Tile>
  );
}

export default BasicTile;