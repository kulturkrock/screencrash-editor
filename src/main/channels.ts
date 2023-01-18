export const GET_LOADING_TEXT = 'get_loading_text';
export const OPEN_OPUS = 'open_opus';
export const LOADED_CHANGED = 'loaded_changed';
export const NODES_CHANGED = 'nodes_changed';
export const ASSETS_CHANGED = 'assets_changed';
export const ACTIONS_CHANGED = 'actions_changed';

export const GET_NODES = 'get_nodes';
export const GET_START_NODE = 'get_start_node';
export const GET_ACTIONS = 'get_actions';
export const GET_ACTION_DESCRIPTIONS = 'get_action_descriptions';
export const GET_ASSETS = 'get_assets';
export const CHECK_NODE_EXISTS = 'node_exists';
export const UPDATE_NODE = 'update_node';
export const UPDATE_ACTION = 'update_action';
export const DELETE_NODE = 'delete_node';

export const LIST_COMMANDS = 'list_commands';
export const RELOAD_COMMANDS = 'reload_commands';

export const SHOW_DIALOG = 'show_dialog';
export const SHOW_ASK_DIALOG = 'show_ask_dialog';

export type Channels =
  | 'get_loading_text'
  | 'open_opus'
  | 'loaded_changed'
  | 'nodes_changed'
  | 'assets_changed'
  | 'actions_changed'
  | 'get_nodes'
  | 'get_start_node'
  | 'get_actions'
  | 'get_action_descriptions'
  | 'get_assets'
  | 'node_exists'
  | 'update_node'
  | 'update_action'
  | 'delete_node'
  | 'list_commands'
  | 'reload_commands'
  | 'show_dialog'
  | 'show_ask_dialog';
