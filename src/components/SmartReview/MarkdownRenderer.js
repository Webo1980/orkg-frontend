import { sanitize } from 'dompurify';
import PropTypes from 'prop-types';
import React from 'react';
import * as Showdown from 'showdown';
import footnotes from 'showdown-footnotes';
import styled from 'styled-components';

const MarkdownContainer = styled.p`
    blockquote {
        color: rgba(0, 0, 0, 0.5);
        padding-left: 1.5em;
        border-left: 5px solid rgba(0, 0, 0, 0.1);
    }
`;

const converter = new Showdown.Converter({
    openLinksInNewWindow: true,
    extensions: [footnotes],
    underline: true
});
converter.setFlavor('github');

/**
 *
 * Markdown renderer, takes care of sanitation to prevent XSS injections
 * and configures the markdown to HTML parser
 */
/* TODO: secure ADD_ATTR */
const MarkdownRenderer = ({ text }) => {
    return <MarkdownContainer dangerouslySetInnerHTML={{ __html: sanitize(converter.makeHtml(text), { ADD_ATTR: ['target'] }) }} />;
};

MarkdownRenderer.propTypes = {
    text: PropTypes.string
};

MarkdownRenderer.defaultProps = {
    text: null
};

export default MarkdownRenderer;
