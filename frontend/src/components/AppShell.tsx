import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { TemplateTreeViewDispatch, setAppInitialized } from "../models";
import { getAppInitialized } from '../selectors';

export interface AppShellProps {
  appInitialized: boolean;
  onSetAppInitialized: () => any;
}

const AppShell = (props: AppShellProps) => {
  return (
    <div>pizza pie</div>
  );
}

function mapStateToProps(state: any) {
  return {
    appInitialized: getAppInitialized(state),
  };
}

const mapDispatchToProps = (dispatch: TemplateTreeViewDispatch) => {
  return bindActionCreators({
    onSetAppInitialized: setAppInitialized,
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(AppShell);
