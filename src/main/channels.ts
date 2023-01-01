export const GET_LOADING_TEXT = 'get_loading_text';
export const OPEN_OPUS = 'open_opus';
export const LOADED_CHANGED = 'loaded_changed';
export const NODES_CHANGED = 'nodes_changed';

export const GET_NODES = 'get_nodes';
export const GET_ACTIONS = 'get_actions';
export const GET_ASSETS = 'get_assets';
export const UPDATE_NODE = 'update_node';

export const SHOW_DIALOG = 'show_dialog';

export type Channels =
  | 'get_loading_text'
  | 'open_opus'
  | 'loaded_changed'
  | 'nodes_changed'
  | 'get_nodes'
  | 'get_actions'
  | 'get_assets'
  | 'update_node'
  | 'show_dialog';
