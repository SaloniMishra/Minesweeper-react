import React, { Component } from 'react';
import Board from './Board';
import styles from '../index.css';

class Game extends Component {
    state = {
        rows: 8,
        columns: 8,
        mines: 10
    };

    render() {
        const { rows, columns, mines } = this.state;
        return (
            <div className={styles.game}>
                <Board rows={rows} columns={columns} mines={mines} />
            </div>
        );
    }
}

export default Game;

