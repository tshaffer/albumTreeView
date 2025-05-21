import {
  Action,
  AnyAction,
} from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { TemplateTreeViewState } from '../types';

export interface TemplateTreeViewBaseAction extends Action {
  type: string;   // override Any - must be a string
  payload: {} | null;
}

export interface TemplateTreeViewModelBaseAction<T> extends Action {
  type: string;   // override Any - must be a string
  payload: T;
  // error?: boolean;
  // meta?: {};
}

export interface TemplateTreeViewAction<T> extends TemplateTreeViewBaseAction {
  payload: T | any;
}

export type TemplateTreeViewDispatch = ThunkDispatch<TemplateTreeViewState, undefined, TemplateTreeViewAction<AnyAction>>;
export type TemplateTreeViewVoidPromiseThunkAction = (dispatch: TemplateTreeViewDispatch, getState: () => TemplateTreeViewState, extraArgument: undefined) => Promise<void>;
export type TemplateTreeViewAnyPromiseThunkAction = (dispatch: TemplateTreeViewDispatch, getState: () => TemplateTreeViewState, extraArgument: undefined) => Promise<any>;
