import React, { useState, useEffect } from 'react';
import { Box, Text, Col } from '@tlon/indigo-react';
import ReactMarkdown from 'react-markdown';
import bigInt from 'big-integer';

import { Link, RouteComponentProps } from 'react-router-dom';
import { Spinner } from '~/views/components/Spinner';
import { Comments } from '~/views/components/Comments';
import { NoteNavigation } from './NoteNavigation';
import GlobalApi from '~/logic/api/global';
import { getLatestRevision, getComments } from '~/logic/lib/publish';
import Author from '~/views/components/Author';
import { Contacts, GraphNode, Graph, Association, Unreads, Group, markEachAsRead } from '@urbit/api';
import useApi from '~/logic/lib/useApi';
import { removeNodes } from '@urbit/api/graph';

interface NoteProps {
  ship: string;
  book: string;
  note: GraphNode;
  unreads: Unreads;
  association: Association;
  notebook: Graph;
  rootUrl: string;
  baseUrl: string;
  group: Group;
}

export function Note(props: NoteProps & RouteComponentProps) {
  const [deleting, setDeleting] = useState(false);

  const { notebook, note, ship, book, rootUrl, baseUrl, group } = props;
  const editCommentId = props.match.params.commentId;
  const api = useApi();

  const deletePost = async () => {
    setDeleting(true);
    const indices = [note.post.index];
    await api.poke(removeNodes(ship, book, indices));
    props.history.push(rootUrl);
  };

  const comments = getComments(note);
  const [revNum, title, body, post] = getLatestRevision(note);
  const index = note.post.index.split('/');

  const noteId = bigInt(index[1]);
  useEffect(() => {
    api.poke(markEachAsRead(props.association, '/', `/${index[1]}/1/1`, 'note', 'publish'));
  }, [props.association, props.note]);

  let adminLinks: JSX.Element | null = null;
  if (window.ship === note?.post?.author) {
    adminLinks = (
      <Box display="inline-block" verticalAlign="middle">
        <Link to={`${baseUrl}/edit`}>
        <Text
          color="green"
          ml={2}
        >
          Update
        </Text>
      </Link>
        <Text
          color="red"
          ml={2}
          onClick={deletePost}
          style={{ cursor: 'pointer' }}
        >
          Delete
        </Text>
      </Box>
    );
  }

  const windowRef = React.useRef(null);
  useEffect(() => {
    if (windowRef.current) {
      windowRef.current.parentElement.scrollTop = 0;
    }
  }, [windowRef, note]);

  return (
    <Box
      my={3}
      px={3}
      display="grid"
      gridTemplateColumns="1fr"
      gridAutoRows="min-content"
      maxWidth="500px"
      width="100%"
      gridRowGap={4}
      mx="auto"
      ref={windowRef}
    >
      <Link to={rootUrl}>
        <Text>{'<- Notebook Index'}</Text>
      </Link>
      <Col>
        <Text display="block" mb={2}>{title || ''}</Text>
        <Box display="flex">
          <Author
            ship={post?.author}
            date={post?.['time-sent']}
          />
          <Text ml={2}>{adminLinks}</Text>
        </Box>
      </Col>
      <Box color="black" className="md" style={{ overflowWrap: 'break-word', overflow: 'hidden' }}>
        <ReactMarkdown source={body} linkTarget={'_blank'} />
      </Box>
      <NoteNavigation
        notebook={notebook}
        noteId={noteId}
        ship={props.ship}
        book={props.book}
      />
      <Comments
        ship={ship}
        name={props.book}
        unreads={props.unreads}
        comments={comments}
        association={props.association}
        baseUrl={baseUrl}
        editCommentId={editCommentId}
        group={group}
      />
      <Spinner
        text="Deleting post..."
        awaiting={deleting}
        classes="absolute bottom-1 right-1 ba b--gray1-d pa2"
      />
    </Box>
  );
}

export default Note;
