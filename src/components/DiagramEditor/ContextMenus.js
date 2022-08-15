import PropTypes from 'prop-types';
import { Menu, Item, Separator } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';

const ContextMenus = ({ actions }) => (
    <>
        <Menu id="menu-id" animation={null}>
            <Item onClick={actions.addNode}>Add node</Item>
            <Separator />
            <Item onClick={actions.zoomIn}>Zoom in</Item>
            <Item onClick={actions.zoomOut}>Zoom out</Item>
        </Menu>
    </>
);

ContextMenus.propTypes = { actions: PropTypes.array };

export default ContextMenus;
