import { Graphs, decToUd, numToUd } from "@urbit/api";
import useApi from "../api";
import GraphReducer from "../reducers/graph-update";

import { BaseState, createState } from "./base";

export interface GraphState extends BaseState<GraphState> {
  graphs: Graphs;
  graphKeys: Set<string>;
  pendingIndices: Record<string, any>;
  graphTimesentMap: Record<string, any>;
  getKeys: () => Promise<void>;
  getTags: () => Promise<void>;
  getTagQueries: () => Promise<void>;
  getGraph: (ship: string, resource: string) => Promise<void>;
  getNewest: (ship: string, resource: string, count: number, index?: string) => Promise<void>;
  getOlderSiblings: (ship: string, resource: string, count: number, index?: string) => Promise<void>;
  getYoungerSiblings: (ship: string, resource: string, count: number, index?: string) => Promise<void>;
  getGraphSubset: (ship: string, resource: string, start: string, end: string) => Promise<void>;
  getNode: (ship: string, resource: string, index: string) => Promise<void>;
};

const useGraphState = createState<GraphState>('Graph', {
  graphs: {},
  graphKeys: new Set(),
  pendingIndices: {},
  graphTimesentMap: {},
  getKeys: async () => {
    const api = useApi();
    const keys = await api.scry({
      app: 'graph-store',
      path: '/keys'
    });
    GraphReducer(keys);
  },
  getTags: async () => {
    const api = useApi();
    const tags = await api.scry({
      app: 'graph-store',
      path: '/tags'
    });
    GraphReducer(tags);
  },
  getTagQueries: async () => {
    const api = useApi();
    const tagQueries = await api.scry({
      app: 'graph-store',
      path: '/tag-queries'
    });
    GraphReducer(tagQueries);
  },
  getGraph: async (ship: string, resource: string) => {
    const api = useApi();
    const graph = await api.scry({
      app: 'graph-store',
      path: `/graph/${ship}/${resource}`
    });
    GraphReducer(graph);
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
    GraphReducer(data);
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
    GraphReducer(data);
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
    GraphReducer(data);
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
    GraphReducer(subset);
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
    GraphReducer(node);
  },
}, ['graphs', 'graphKeys']);

export default useGraphState;