import { Graphs, decToUd, numToUd } from "@urbit/api";
import React from "react";
import create, { State } from "zustand";
import { persist } from "zustand/middleware";

import useApi from "~/logic/lib/useApi";
import { stateSetter } from "~/logic/lib/util";
import { graphReducer } from "~/logic/subscription/graph";

export interface GraphState extends State {
  graphs: Graphs;
  graphKeys: Set<string>;
  getKeys: () => Promise<void>;
  getTags: () => Promise<void>;
  getTagQueries: () => Promise<void>;
  getGraph: (ship: string, resource: string) => Promise<void>;
  getNewest: (ship: string, resource: string, count: number, index?: string) => Promise<void>;
  getOlderSiblings: (ship: string, resource: string, count: number, index?: string) => Promise<void>;
  getYoungerSiblings: (ship: string, resource: string, count: number, index?: string) => Promise<void>;
  getGraphSubset: (ship: string, resource: string, start: string, end: string) => Promise<void>;
  getNode: (ship: string, resource: string, index: string) => Promise<void>;
  set: (fn: (state: GraphState) => void) => void;
};

const useGraphState = create<GraphState>(persist((set, get) => ({
  graphs: {},
  graphKeys: new Set(),
  getKeys: async () => {
    const api = useApi();
    const keys = await api.scry({
      app: 'graph-store',
      path: '/keys'
    });
    graphReducer(keys);
  },
  getTags: async () => {
    const api = useApi();
    const tags = await api.scry({
      app: 'graph-store',
      path: '/tags'
    });
    graphReducer(tags);
  },
  getTagQueries: async () => {
    const api = useApi();
    const tagQueries = await api.scry({
      app: 'graph-store',
      path: '/tag-queries'
    });
    graphReducer(tagQueries);
  },
  getGraph: async (ship: string, resource: string) => {
    const api = useApi();
    const graph = await api.scry({
      app: 'graph-store',
      path: `/graph/${ship}/${resource}`
    });
    graphReducer(graph);
  },
  getNewest: async (
    ship: string,
    resource: string,
    count: number,
    index: string = ''
  ) => {
    const api = useApi();
    const data = await api.scry({
      app: 'graph-store',
      path: `/newest/${ship}/${resource}/${count}${index}`
    });
    graphReducer(data);
  },
  getOlderSiblings: async (
    ship: string,
    resource: string,
    count: number,
    index: string = ''
  ) => {
    const api = useApi();
    index = index.split('/').map(decToUd).join('/');
    const data = await api.scry({
      app: 'graph-store',
      path: `/node-siblings/older/${ship}/${resource}/${count}${index}`
    });
    graphReducer(data);
  },
  getYoungerSiblings: async (
    ship: string,
    resource: string,
    count: number,
    index: string = ''
  ) => {
    const api = useApi();
    index = index.split('/').map(decToUd).join('/');
    const data = await api.scry({
      app: 'graph-store',
      path: `/node-siblings/younger/${ship}/${resource}/${count}${index}`
    });
    graphReducer(data);
  },
  getGraphSubset: async (
    ship: string,
    resource: string,
    start: string,
    end: string
  ) => {
    const api = useApi();
    const subset = await api.scry({
      app: 'graph-store',
      path: `/graph-subset/${ship}/${resource}/${end}/${start}`
    });
    graphReducer(subset);
  },
  getNode: async (
    ship: string,
    resource: string,
    index: string
  ) => {
    const api = useApi();
    index = index.split('/').map(numToUd).join('/');
    const node = api.scry({
      app: 'graph-store',
      path: `/node/${ship}/${resource}${index}`
    });
    graphReducer(node);
  },
  set: fn => stateSetter(fn, set)
}), {
  blacklist: ['graphKeys'],
  name: 'GraphReducer'
}));

function withGraphState<P, S extends keyof GraphState>(Component: any, stateMemberKeys?: S[]) {
  return React.forwardRef((props: Omit<P, S>, ref) => {
    const graphState = stateMemberKeys ? useGraphState(
      state => stateMemberKeys.reduce(
        (object, key) => ({ ...object, [key]: state[key] }), {}
      )
    ): useGraphState();
    return <Component ref={ref} {...graphState} {...props} />
  });
}

export { useGraphState as default, withGraphState };