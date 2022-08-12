import styled from 'styled-components';
import { CanvasWidget as CoreCanvasWidget } from '@projectstorm/react-canvas-core';
import PropTypes from 'prop-types';
import { useContextMenu } from 'react-contexify';
import ContextMenus from './ContextMenus';

const FullscreenCanvas = styled(CoreCanvasWidget)`
    height: 100%;
    width: 100%;
    border: 1px solid #ccc;
`;

const Wrapper = styled.div`
    height: 100%;
    width: 100%;
`;

const MENU_ID = 'menu-id';

function CanvasWidget({ engine, actions }) {
    // 🔥 you can use this hook from everywhere. All you need is the menu id
    const { show } = useContextMenu({
        id: MENU_ID,
    });

    return (
        <Wrapper onContextMenu={show}>
            <FullscreenCanvas engine={engine} />

            <ContextMenus actions={actions} />
        </Wrapper>
    );
}

CanvasWidget.propTypes = {
    engine: PropTypes.object.isRequired,
    actions: PropTypes.array,
};

export default CanvasWidget;
