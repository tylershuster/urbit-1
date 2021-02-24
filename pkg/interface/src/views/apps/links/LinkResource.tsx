import React, { useEffect } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import bigInt from 'big-integer';
import { RouteComponentProps } from 'react-router-dom';

import { Box, Col, Center, LoadingSpinner, Text } from '@tlon/indigo-react';
import { Association } from '@urbit/api/metadata';

import { StoreState } from '~/logic/store/type';
import { LinkItem } from './components/LinkItem';
import { LinkWindow } from './LinkWindow';
import { Comments } from '~/views/components/Comments';
import './css/custom.css';
import useMetadataState from '~/logic/state/metadata';
import useContactState from '~/logic/state/contacts';
import useGroupState from '~/logic/state/groups';
import useGraphState from '~/logic/state/graph';

const emptyMeasure = () => {};

type LinkResourceProps = StoreState & {
  association: Association;
  baseUrl: string;
} & RouteComponentProps;

export function LinkResource(props: LinkResourceProps) {
  const {
    association,
    baseUrl,
    s3,
  } = props;

  const rid = association.resource;
  const associations = useMetadataState(state => state.associations);
  const contacts = useContactState(state => state.contacts);
  const groups = useGroupState(state => state.groups);
  const graphs = useGraphState(state => state.graphs);
  const getGraph = useGraphState(state => state.getGraph);

  const relativePath = (p: string) => `${baseUrl}/resource/link${rid}${p}`;

  const [, , ship, name] = rid.split('/');
  const resourcePath = `${ship.slice(1)}/${name}`;
  const resource = associations.graph[rid]
    ? associations.graph[rid]
    : { metadata: {} };
  const group = groups[resource?.group] || {};

  const graph = graphs[resourcePath] || null;

  useEffect(() => {
    getGraph(ship, name);
  }, [association]);

  const resourceUrl = `${baseUrl}/resource/link${rid}`;
  if (!graph) {
    return <Center width='100%' height='100%'><LoadingSpinner /></Center>;
  }

  return (
    <Col alignItems="center" height="100%" width="100%" overflowY="hidden">
      <Switch>
        <Route
          exact
          path={relativePath('')}
          render={(props) => {
            return (
              <LinkWindow
                s3={s3}
                association={resource}
                resource={resourcePath}
                graph={graph}
                baseUrl={resourceUrl}
                group={group}
                path={resource.group}
                mb={3}
              />
            );
          }}
        />
        <Route
          path={relativePath('/:index(\\d+)/:commentId?')}
          render={(props) => {
            const index = bigInt(props.match.params.index);
            const editCommentId = props.match.params.commentId || null;

            if (!index) {
              return <div>Malformed URL</div>;
            }

            const node = graph ? graph.get(index) : null;

            if (!node) {
              return <Box>Not found</Box>;
            }
            return (
              <Col alignItems="center" overflowY="auto" width="100%">
              <Col width="100%" p={3} maxWidth="768px">
                <Link to={resourceUrl}><Text px={3} bold>{'<- Back'}</Text></Link>
                <LinkItem
                  key={node.post.index}
                  resource={resourcePath}
                  node={node}
                  baseUrl={resourceUrl}
                  group={group}
                  path={resource?.group}
                  mt={3}
                  measure={emptyMeasure}
                />
                <Comments
                  ship={ship}
                  name={name}
                  comments={node}
                  resource={resourcePath}
                  association={association}
                  editCommentId={editCommentId}
                  baseUrl={`${resourceUrl}/${props.match.params.index}`}
                  group={group}
                  px={3}
                />
              </Col>
            </Col>
            );
          }}
        />
      </Switch>
    </Col>
  );
}
