import React from 'react';

import BasicTile from './tiles/basic';
import CustomTile from './tiles/custom';
import ClockTile from './tiles/clock';
import WeatherTile from './tiles/weather';

const Tiles = (props) => {
  const tiles = props.tileOrdering.filter((key) => {
    const tile = props.tiles[key];
    return tile.isShown;
  }).map((key) => {
    const tile = props.tiles[key];
    if ('basic' in tile.type) {
      const basic = tile.type.basic;
      return (
        <BasicTile
          key={key}
          title={basic.title}
          iconUrl={basic.iconUrl}
          linkedUrl={basic.linkedUrl}
        />
      );
    } else if ('custom' in tile.type) {
      if (key === 'weather') {
        return (
          <WeatherTile
            key={key}
            weather={props.weather} 
            location={props.location}
          />
        );
      } else if (key === 'clock') {
        const location = 'nearest-area' in props.weather ? props.weather['nearest-area'][0] : '';
        return (
          <ClockTile key={key} location={location} />
        );
      }
    } else {
      return <CustomTile key={key} />;
    }
  });

  return (
    <React.Fragment>{tiles}</React.Fragment>
  );
}

export default Tiles

