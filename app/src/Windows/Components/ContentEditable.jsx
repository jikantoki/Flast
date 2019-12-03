import React, { Component, createRef } from 'react';

export default class ContentEditable extends Component {
    constructor(props) {
        super(props);
        this.elem = createRef();
    }
    onChange = e => {
        const { onChange } = this.props;
        const value = this.elem.current.innerText;

        onChange && onChange(e, value);
    };

    onPaste = e => {
        const { onPaste } = this.props;
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        document.execCommand('insertText', false, text);

        onPaste && onPaste(e);
    };

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.html !== this.elem.current.innerText;
    }

    render() {
        const { node, html, editable } = this.props;
        const Element = node || 'div';

        return (
            <Element
                ref={this.elem}
                dangerouslySetInnerHTML={{ __html: html }}
                contentEditable={editable}
                onInput={this.onChange}
                onPaste={this.onPaste}
            />
        );
    }
}