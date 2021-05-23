import React from 'react';
import PropTypes from 'prop-types';
import Cell from './Cell';
import styles from '../index.css';

export default class Board extends React.Component {
    state = {
        boardData: this.initBoard(this.props.rows, this.props.columns, this.props.mines),
        gameText: "Game in progress",
        gameStatus : "inProgress",
        mineCount: this.props.mines,
        time : "00:00"
    };



    countdown;
    upgradeTime = 1;
    seconds = this.upgradeTime;
    getMines(data) {
        let mineArray = [];

        data.map(datarow => {
            datarow.map((dataitem) => {
                if (dataitem.isMine) {
                    mineArray.push(dataitem);
                }
            });
        });

        return mineArray;
    }

    getFlags(data) {
        let mineArray = [];

        data.map(datarow => {
            datarow.map((dataitem) => {
                if (dataitem.isFlagged) {
                    mineArray.push(dataitem);
                }
            });
        });

        return mineArray;
    }

    getHidden(data) {
        let mineArray = [];

        data.map(datarow => {
            datarow.map((dataitem) => {
                if (!dataitem.isRevealed) {
                    mineArray.push(dataitem);
                }
            });
        });

        return mineArray;
    }

    getRandomValue(dimension) {
        return Math.floor((Math.random() * 1000) + 1) % dimension;
    }
    initBoard(rows, columns, mines) {
        let data = this.createBoard(rows, columns);
        data = this.addMinesOnBoard(data, rows, columns, mines);
        data = this.getSurroundingCells(data, rows, columns);
        return data;
    }

    createBoard(rows, columns) {
        let data = [];

        for (let i = 0; i < rows; i++) {
            data.push([]);
            for (let j = 0; j < columns; j++) {
                data[i][j] = {
                    x: i,
                    y: j,
                    isMine: false,
                    neighbour: 0,
                    isRevealed: false,
                    isEmpty: false,
                    isFlagged: false,
                };
            }
        }
        return data;
    }

    addMinesOnBoard(data, rows, columns, mines) {
        let xValue, yValue, minesPlanted = 0;

        while (minesPlanted < mines) {
            xValue = this.getRandomValue(columns);
            yValue = this.getRandomValue(rows);
            if (!(data[xValue][yValue].isMine)) {
                data[xValue][yValue].isMine = true;
                minesPlanted++;
            }
        }

        return (data);
    }
    getSurroundingCells(data, rows, columns) {
        let updatedData = data;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (data[i][j].isMine !== true) {
                    let mine = 0;
                    const area = this.traverseBoard(data[i][j].x, data[i][j].y, data);
                    area.map(value => {
                        if (value.isMine) {
                            mine++;
                        }
                    });
                    if (mine === 0) {
                        updatedData[i][j].isEmpty = true;
                    }
                    updatedData[i][j].neighbour = mine;
                }
            }
        }

        return (updatedData);
    };
    traverseBoard(x, y, data) {
        const el = [];

        if (x > 0) {
            el.push(data[x - 1][y]);
        }

        if (x < this.props.rows - 1) {
            el.push(data[x + 1][y]);
        }

        if (y > 0) {
            el.push(data[x][y - 1]);
        }

        if (y < this.props.columns - 1) {
            el.push(data[x][y + 1]);
        }

        if (x > 0 && y > 0) {
            el.push(data[x - 1][y - 1]);
        }

        if (x > 0 && y < this.props.columns - 1) {
            el.push(data[x - 1][y + 1]);
        }

        if (x < this.props.rows - 1 && y < this.props.columns - 1) {
            el.push(data[x + 1][y + 1]);
        }

        if (x < this.props.rows - 1 && y > 0) {
            el.push(data[x + 1][y - 1]);
        }

        return el;
    }
    revealBoard() {
        let updatedData = this.state.boardData;
        updatedData.map((datarow) => {
            datarow.map((dataitem) => {
                dataitem.isRevealed = true;
            });
        });
        this.setState({
            boardData: updatedData
        })
    }

    revealEmpty(x, y, data) {
        let area = this.traverseBoard(x, y, data);
        area.map(value => {
            if (!value.isFlagged && !value.isRevealed && (value.isEmpty || !value.isMine)) {
                data[value.x][value.y].isRevealed = true;
                if (value.isEmpty) {
                    this.revealEmpty(value.x, value.y, data);
                }
            }
        });
        return data;

    }

    cellClick(x, y) {
        if (this.state.boardData[x][y].isRevealed || this.state.boardData[x][y].isFlagged) return null;

        if (this.state.boardData[x][y].isMine) {
            this.setState({ gameText: "Alas! You have Lost.", gameStatus : "lost" });
            clearInterval(this.countdown);
            this.revealBoard();
        }

        let updatedData = this.state.boardData;
        updatedData[x][y].isFlagged = false;
        updatedData[x][y].isRevealed = true;

        if (updatedData[x][y].isEmpty) {
            updatedData = this.revealEmpty(x, y, updatedData);
        }

        if (this.getHidden(updatedData).length === this.props.mines) {
            this.setState({ mineCount: 0, gameText: "You have won.", gameStatus : "won" });
            this.revealBoard();
        }

        this.setState({
            boardData: updatedData,
            mineCount: this.props.mines - this.getFlags(updatedData).length,
        });
    }

    flagClick(e, x, y) {
        e.preventDefault();
        let updatedData = this.state.boardData;
        let mines = this.state.mineCount;

        // check if already revealed
        if (updatedData[x][y].isRevealed) return;

        if (updatedData[x][y].isFlagged) {
            updatedData[x][y].isFlagged = false;
            mines++;
        } else {
            updatedData[x][y].isFlagged = true;
            mines--;
        }

        if (mines === 0) {
            const mineArray = this.getMines(updatedData);
            const FlagArray = this.getFlags(updatedData);
            if (JSON.stringify(mineArray) === JSON.stringify(FlagArray)) {
                this.setState({ mineCount: 0, gameText: "You Win.", gameStatus : "won" });
                this.revealBoard();
            }
        }

        this.setState({
            boardData: updatedData,
            mineCount: mines,
        });
    }

    showBoard(data) {
        return data.map((datarow) => {
            return datarow.map((dataitem) => {
                return (
                    <div key={dataitem.x * datarow.length + dataitem.y}>
                        <Cell
                            onClick={() => this.cellClick(dataitem.x, dataitem.y)}
                            cMenu={(e) => this.flagClick(e, dataitem.x, dataitem.y)}
                            value={dataitem}
                        />
                        {(datarow[datarow.length - 1] === dataitem) ? <div className={styles.clear} /> : ""}
                    </div>);
            })
        });

    }

    resetTable() {
        this.setState({
            boardData: this.initBoard(this.props.rows, this.props.columns, this.props.mines),
            gameText: "Game in progress",
            gameStatus : "inProgress",
            mineCount: this.props.mines
        });
        this.seconds = this.upgradeTime;
        this.countdown = setInterval(this.timer.bind(this), 1000);
    }

    timer() {
        var days = Math.floor(this.seconds/24/60/60);
        var hoursLeft  = Math.floor((this.seconds) - (days*86400));
        var hours      = Math.floor(hoursLeft/3600);
        var minutesLeft = Math.floor((hoursLeft) - (hours*3600));
        var minutes    = Math.floor(minutesLeft/60);
        var remainingSeconds = this.seconds % 60;
        function pad(n) {
            return (n < 10 ? "0" + n : n);

        }
        document.getElementById('countdown').innerHTML = pad(hours) + ":" + pad(minutes) + ":" + pad(remainingSeconds);
        this.seconds++;

    }

    componentDidMount() {
        this.seconds = this.upgradeTime;
        this.countdown = setInterval(this.timer.bind(this), 1000);
    };

    render() {
        return (
            <div>
                <div className={styles.gameInfo}>
                    <span className={styles.info}>Mines remaining: {this.state.mineCount}</span>
                    <h1 className={styles.info}>{this.state.gameText}</h1>
                    <div id='countdown'></div>
                </div>
                {
                    this.showBoard(this.state.boardData)
                }
                {this.state.gameStatus === 'lost' ? <button className={styles.resetBtn} onClick={() => this.resetTable()}>Restart Game!</button> : ''}
            </div>
        );
    }
}

Board.propTypes = {
    rows: PropTypes.number,
    columns: PropTypes.number,
    mines: PropTypes.number,
}
