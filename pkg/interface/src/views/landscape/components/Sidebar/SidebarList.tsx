import React, { ReactElement } from 'react';

import { AppAssociations } from '@urbit/api';

import { alphabeticalOrder } from '~/logic/lib/util';
import { SidebarAppConfigs, SidebarListConfig, SidebarSort } from './types';
import { SidebarItem } from './SidebarItem';
import { Workspace } from '~/types/workspace';
import useMetadataState from '~/logic/state/metadata';
import useGroupState from '~/logic/state/groups';

function sidebarSort(
  associations: AppAssociations,
  apps: SidebarAppConfigs
): Record<SidebarSort, (a: string, b: string) => number> {
  const alphabetical = (a: string, b: string) => {
    const aAssoc = associations[a];
    const bAssoc = associations[b];
    const aTitle = aAssoc?.metadata?.title || b;
    const bTitle = bAssoc?.metadata?.title || b;

    return alphabeticalOrder(aTitle, bTitle);
  };

  const lastUpdated = (a: string, b: string) => {
    const aAssoc = associations[a];
    const bAssoc = associations[b];
    const aAppName = aAssoc?.['app-name'];
    const bAppName = bAssoc?.['app-name'];

    const aUpdated = apps[aAppName]?.lastUpdated(a) || 0;
    const bUpdated = apps[bAppName]?.lastUpdated(b) || 0;

    return bUpdated - aUpdated || alphabetical(a, b);
  };

  return {
    asc: alphabetical,
    lastUpdated
  };
}

export function SidebarList(props: {
  apps: SidebarAppConfigs;
  config: SidebarListConfig;
  baseUrl: string;
  group?: string;
  selected?: string;
  workspace: Workspace;
}): ReactElement {
  const { selected, group, config, workspace } = props;
  const associations = useMetadataState(state => state.associations);
  const groups = useGroupState(state => state.groups);
  const graphAssociations = { ...associations.graph };

  const ordered = Object.keys(graphAssociations)
    .filter((a) => {
      const assoc = graphAssociations[a];
      if (workspace?.type === 'messages') {
        return (!(assoc.group in groups) && assoc.metadata.module === 'chat');
      } else {
        return group
          ? assoc.group === group
          : (!(assoc.group in groups) && assoc.metadata.module !== 'chat');
      }
    })
    .sort(sidebarSort(graphAssociations, props.apps)[config.sortBy]);

  return (
    <>
      {ordered.map((path) => {
        const assoc = graphAssociations[path];
        return (
          <SidebarItem
            key={path}
            path={path}
            selected={path === selected}
            association={assoc}
            apps={props.apps}
            hideUnjoined={config.hideUnjoined}
            workspace={workspace}
          />
        );
      })}
    </>
  );
}
