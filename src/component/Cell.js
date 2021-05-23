import React from 'react';
import PropTypes from 'prop-types';
import styles from '../index.css';

export default class Cell extends React.Component {
    getValue() {
        const { value } = this.props;

        if (!value.isRevealed) {
            return this.props.value.isFlagged ? "🚩" : null;
        }
        if (value.isMine) {
            return "💣";
        }
        if (value.neighbour === 0) {
            return null;
        }
        return value.neighbour;
    }

    render() {
        const { value, onClick, cMenu } = this.props;
        let className = [styles.cell];
        if(!value.isRevealed) {
            className = [...className, styles.hidden];
        }
        if(value.isMine) {
            className = [...className, styles.isMine];
        }
        if(value.isFlagged) {
            className = [...className, styles.isFlag];
        }
        className = className.join(' ').trim();

        return (
            <div
                onClick={onClick}
                className={className}
                onContextMenu={cMenu}
            >
                {this.getValue()}
            </div>
        );
    }
}

Cell.propTypes = {
    isRevealed: PropTypes.bool,
    isMine: PropTypes.bool,
    isFlagged: PropTypes.bool
};
