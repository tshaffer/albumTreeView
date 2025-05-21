/** @module Model:base */

import { combineReducers } from 'redux';
import { TemplateTreeViewState } from '../types';

import { appStateReducer } from './appState';

// -----------------------------------------------------------------------
// Reducers
// -----------------------------------------------------------------------
export const rootReducer = combineReducers<TemplateTreeViewState>({
  appState: appStateReducer,
});

// -----------------------------------------------------------------------
// Validators
// -----------------------------------------------------------------------

