import React, { useEffect, ReactNode } from 'react';
import {
  Switch,
  Route,
  RouteComponentProps
} from 'react-router-dom';
import _ from 'lodash';
import Helmet from 'react-helmet';

import { Col, Box, Text } from '@tlon/indigo-react';
import { AppName } from '@urbit/api';

import { Resource } from './Resource';
import { PopoverRoutes } from './PopoverRoutes';
import { Skeleton } from './Skeleton';
import { InvitePopover } from './InvitePopover';
import { NewChannel } from './NewChannel';

import { StoreState } from '~/logic/store/type';
import { UnjoinedResource } from '~/views/components/UnjoinedResource';
import { useLocalStorageState } from '~/logic/lib/useLocalStorageState';
import { Loading } from '~/views/components/Loading';

import '~/views/apps/links/css/custom.css';
import '~/views/apps/publish/css/custom.css';
import { getGroupFromWorkspace } from '~/logic/lib/workspace';
import { GroupSummary } from './GroupSummary';
import { Workspace } from '~/types/workspace';
import useMetadataState from '~/logic/state/metadata';
import useGroupState from '~/logic/state/groups';
import useContactState from '~/logic/state/contacts';
import useHarkState from '~/logic/state/hark';

type GroupsPaneProps = StoreState & {
  baseUrl: string;
  workspace: Workspace;
};

export function GroupsPane(props: GroupsPaneProps) {
  const { baseUrl, workspace } = props;
  const associations = useMetadataState(state => state.associations);
  const groups = useGroupState(state => state.groups);
  const contacts = useContactState(state => state.contacts);
  const notificationsCount = useHarkState(state => state.notifications);
  const relativePath = (path: string) => baseUrl + path;
  const groupPath = getGroupFromWorkspace(workspace);

  const groupContacts = Object.assign({}, ...Array.from(groups?.[groupPath]?.members ?? []).filter(e => contacts[`~${e}`]).map(e => {
      return {[e]: contacts[`~${e}`]};
  })) || {};
  const rootIdentity = contacts?.["/~/default"]?.[window.ship];
  const groupAssociation =
    (groupPath && associations.groups[groupPath]) || undefined;
  const group = (groupPath && groups[groupPath]) || undefined;
  const [recentGroups, setRecentGroups] = useLocalStorageState<string[]>(
    'recent-groups',
    []
  );

  useEffect(() => {
    if (workspace.type !== 'group') {
      return;
    }
    setRecentGroups(gs => _.uniq([workspace.group, ...gs]));
  }, [workspace]);

  if (!(associations && (groupPath ? groupPath in groups : true))) {
    return null;
  }

  const popovers = (routeProps: RouteComponentProps, baseUrl: string) =>
     ( <>
        {groupPath && ( <PopoverRoutes
          contacts={groupContacts || {}}
          rootIdentity={rootIdentity}
          association={groupAssociation!}
          group={group!}
          s3={props.s3}
          notificationsGroupConfig={props.notificationsGroupConfig}
          associations={associations}

          {...routeProps}
          baseUrl={baseUrl}
                        />)}
        <InvitePopover
          association={groupAssociation!}
          baseUrl={baseUrl}
          workspace={workspace}
        />
      </>
    );

  return (
    <Switch>
      <Route
        path={[relativePath('/resource/:app/(ship)?/:host/:name')]}
        render={(routeProps) => {
          const { app, host, name } = routeProps.match.params as Record<
            string,
            string
          >;

          const appName = app as AppName;

          const resource = `/ship/${host}/${name}`;
          const association = associations.graph[resource];
          const resourceUrl = `${baseUrl}/resource/${app}${resource}`;

          if (!association) {
            return <Loading />;
          }

          return (
            <Skeleton
              mobileHide
              recentGroups={recentGroups}
              selected={resource}
              selectedApp={appName}
              {...props}
              baseUrl={resourceUrl}
            >
              <Resource
                {...props}
                {...routeProps}
                association={association}
                baseUrl={baseUrl}
              />
              {popovers(routeProps, resourceUrl)}
            </Skeleton>
          );
        }}
      />
      <Route
        path={relativePath('/join/:app/(ship)?/:host/:name')}
        render={(routeProps) => {
          const { app, host, name } = routeProps.match.params;
          const appPath = `/ship/${host}/${name}`;
          const association = associations.graph[appPath];
          const resourceUrl = `${baseUrl}/join/${app}${appPath}`;
          let title = groupAssociation?.metadata?.title ?? 'Landscape';

          if (!association) {
            return <Loading />;
          }

          title += ` - ${association.metadata.title}`;
          return (
            <>
              <Helmet defer={false}>
                <title>{notificationsCount ? `(${String(notificationsCount)}) ` : ''}{ title }</title>
              </Helmet>
              <Skeleton
                recentGroups={recentGroups}
                mobileHide
                selected={appPath}
                {...props}
                baseUrl={baseUrl}
              >
                <UnjoinedResource
                  graphKeys={props.graphKeys}
                  notebooks={props.notebooks}
                  inbox={props.inbox}
                  baseUrl={baseUrl}
                  association={association}
                />
                {popovers(routeProps, resourceUrl)}
              </Skeleton>
            </>
          );
        }}
      />
      <Route
        path={relativePath('/new')}
        render={(routeProps) => {
          const newUrl = `${baseUrl}/new`;
          return (
            <Skeleton mobileHide recentGroups={recentGroups} {...props} baseUrl={baseUrl}>
              <NewChannel
                {...routeProps}
                baseUrl={baseUrl}
                group={groupPath}
                workspace={workspace}
              />
              {popovers(routeProps, baseUrl)}
            </Skeleton>
          );
        }}
      />
      <Route
        path={relativePath('')}
        render={(routeProps) => {
          const hasDescription = groupAssociation?.metadata?.description;
          const channelCount = Object.keys(associations?.graph ?? {}).filter((e) => {
            return associations?.graph?.[e]?.['group'] === groupPath;
          }).length;
          let summary: ReactNode;
          if(groupAssociation?.group) {
            const memberCount = groups[groupAssociation.group].members.size;
            summary = <GroupSummary
              memberCount={memberCount}
              channelCount={channelCount}
              metadata={groupAssociation.metadata}
              resource={groupAssociation.group}
                      />;
          } else {
            summary = (<Box p="4"><Text fontSize="0" color='gray'>
                        Create or select a channel to get started
                      </Text></Box>);
          }
          const title = groupAssociation?.metadata?.title ?? 'Landscape';
          return (
            <>
              <Helmet defer={false}>
                <title>{notificationsCount ? `(${String(notificationsCount)}) ` : ''}{ title }</title>
              </Helmet>
              <Skeleton recentGroups={recentGroups} {...props} baseUrl={baseUrl}>
                <Col
                  alignItems="center"
                  justifyContent="center"
                  display={['none', 'flex']}
                  p='4'
                >
                {summary}
                </Col>
                {popovers(routeProps, baseUrl)}
              </Skeleton>
            </>
          );
        }}
      />
    </Switch>
  );
}
