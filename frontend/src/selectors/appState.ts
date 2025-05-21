import { TemplateTreeViewState } from '../types';

export const getAppInitialized = (state: TemplateTreeViewState): boolean => {
  return state.appState.appInitialized;
};

