'use strict'
//GLOBALS
const STARTBUTTON = '😀';
const ENDBUTTON = '😥';
const WIN = '😎';
const LIVE = '❤';
const CLUE = '🎁';

var gBoard; //A Matrix containing cell objects
//Each cell: {
//            minesAroundCount: 4,
//            isShown: true,
//            isMine: false,
//            isMarked: true
//            }


//The model
var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 1,
    CLUES: 0
};

var gGame = {
    isOn: false, //isOn: Boolean, when true we let the user play
    shownCount: 0, //shownCount: How many cells are shown
    markedCount: 0, //markedCount: How many cells are marked (with a flag)
    secsPassed: 0 //secsPassed: How many seconds passed
};

var gMines;
var gTimer;
var isFirstPress;
var isClue = false;
var gStep;
var gHighScores = [];

function initGame() {
    switch (+document.querySelector('input[name="level"]:checked').value) {
        case 1:
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            gLevel.LIVES = 1;
            gLevel.CLUES = 2;
            break;
        case 2:
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            gLevel.LIVES = 3;
            gLevel.CLUES = 3;
            break;
        case 3:
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            gLevel.LIVES = 3;
            gLevel.CLUES = 3;
            break;
    }
    gMines = [];
    gBoard = [];
    isFirstPress = true;
    buildBoard();
    renderBoard(gBoard);
    gGame.isOn = true;
    document.querySelector('.start-button').innerText = STARTBUTTON;
    document.querySelector('.lives').innerText = LIVE.repeat(gLevel.LIVES);
    document.querySelector('.clues').innerText = CLUE.repeat(gLevel.CLUES);
    clearInterval(gTimer);
    document.querySelector('.txt-timer').innerText = '000';
    gTimer = setInterval(timer, 1000);
}

function addMines(elCell, i, j) {
    randomizeMines(i, j);
    setMines(gBoard, gMines);
    setMinesNegsCount(gBoard);
    isFirstPress = false;
    cellClicked(elCell, i, j);
}

function buildBoard() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isHinted: false
            }
        }
    }
}

function randomizeMines(i, j) {
    var emptyCells = getEmptyCellInBoard(gBoard);
    var idx = findArrayInArray([i, j], emptyCells);
    if (idx >= 0) emptyCells.splice(idx, 1);
    for (var i = 0; i < gLevel.MINES; i++) {
        var cell = getRandomCell(emptyCells);
        emptyCells.splice(findArrayInArray([i, j], emptyCells), 1);
        gMines.push(cell);
    }
}

function setMines(board, mines) {
    for (var i = 0; i < mines.length; i++) {
        board[mines[i][0]][mines[i][1]].isMine = true;
    }
    document.querySelector('.flags').innerText = mines.length;
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            gBoard[i][j].minesAroundCount = countMinesAround(board, { i: i, j: j });
        }
    }
}

function countMinesAround(board, location) {
    var mines = 0;

    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === location.i && j === location.j) continue;
            var val = board[i][j];
            if (val.isMine) mines++;
        }
    }

    return mines;
}
function renderBoard(board) {
    //Render the board as a <table> to the page    
    printMat(board, '.board')
}

function cellClicked(elCell, i, j) {
    // Called when a cell (td) is clicked
    if (!gGame.isOn || gBoard[i][j].isShown) return;
    if (isFirstPress) {
        addMines(elCell, i, j);
        return
    }
    if (isClue) {
        revealClue(elCell, i, j);
        setTimeout(hideClue, 1000, elCell, i, j);
        return;
    }

    if (gBoard[i][j].isMine) {
        if (gBoard[i][j].isMarked) {
            document.querySelector('.flags').innerText++;
        }
        if (gLevel.LIVES > 0) {
            gLevel.LIVES--;
            document.querySelector('.lives').innerText = LIVE.repeat(gLevel.LIVES);
            elCell.classList.add('mine');
            gBoard[i][j].isShown = true;
            gBoard[i][j].isMarked = false;
            document.querySelector('.flags').innerText--;
            checkGameOver();
        } else {
            elCell.classList.add('red');
            revealAllMines();
            gGame.isOn = false;
            checkGameOver();
        }
    } else {
        if (gBoard[i][j].isMarked) {
            document.querySelector('.flags').innerText++;
            elCell.classList.remove('flag');
            gBoard[i][j].isMarked = false;
        }
        if (gBoard[i][j].minesAroundCount > 0) {
            gBoard[i][j].isShown = true;
            renderCellText(i, j, gBoard[i][j].minesAroundCount);
        } else {
            revealNegs(i, j);
        }

        checkGameOver();
    }
}

function revealNegs(i, j) {
    // gBoard[i][j].isShown=true;
    // elCell.classList.add('empty');

    for (var cellI = i - 1; cellI <= i + 1; cellI++) {
        if (cellI < 0 || cellI >= gBoard.length) continue;
        for (var cellJ = j - 1; cellJ <= j + 1; cellJ++) {
            if (cellJ < 0 || cellJ >= gBoard[0].length) continue;
            //if (cellI === i && cellJ === j) continue;
            var val = gBoard[cellI][cellJ];
            if (isClue) {
                // debugger
                val.isHinted = true;
                if (val.isMine) {
                    document.querySelector(`.cell${cellI}-${cellJ}`).classList.add('mine');
                }
            } else {
                if (val.isMine) continue;
                if (!val.isMarked) gBoard[cellI][cellJ].isShown = true;
            }
            renderCellText(cellI, cellJ, val.minesAroundCount);
            // revealNegs(i + 1, j + 1);
        }
    }
}

function cellMarked(elCell, i, j) {
    // Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
    if (!gGame.isOn) return;
    if (gBoard[i][j].isShown) return;

    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        elCell.classList.remove('flag');
        document.querySelector('.flags').innerText++;
    } else {
        // if (!elCell.classList.contains('mine') && !elCell.classList.contains('red')) {
        if (document.querySelector('.flags').innerText !== "0") {
            gBoard[i][j].isMarked = true;
            elCell.classList.add('flag');
            document.querySelector('.flags').innerText--;
        }
        // }
    }
    checkGameOver();
}

function checkGameOver() {
    //Game ends when all mines are marked, and all the other cells are shown

    if (!gGame.isOn) {
        document.querySelector('.start-button').innerText = ENDBUTTON;
        clearInterval(gTimer);

    } else {
        for (var i = 0; i < gLevel.SIZE; i++) {
            for (var j = 0; j < gLevel.SIZE; j++) {
                var elCell = document.querySelector(`.cell${i}-${j}`);
                if (findArrayInArray([i, j], gMines) >= 0) {
                    if (!elCell.classList.contains('flag') && !elCell.classList.contains('mine')) {
                        return false
                    }
                } else {
                    // elCell = document.querySelector(`.cell${i}-${j}`);
                    // if (!elCell.classList.contains('empty')) {
                    if (!gBoard[i][j].isShown && !elCell.classList.contains('flag')) {
                        return false
                    }
                }
            }
        }
        console.log('WIN!');
        gGame.isOn = false;
        clearInterval(gTimer);
        gGame.secsPassed = +document.querySelector('.txt-timer').innerText;
        gHighScores.push(gGame.secsPassed);
        var highScoreHTML = getHighScores();
        document.querySelector('.best-scores-list').innerHTML = highScoreHTML;
        document.querySelector('.start-button').innerText = WIN;
    }
}

function expandShown(board, elCell, i, j) {
    //When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors. 

}

function timer() {
    var time = document.querySelector('.txt-timer').innerText;
    time++;
    document.querySelector('.txt-timer').innerText = pad(time, 3);
}

function revealAllMines() {
    for (var i = 0; i < gMines.length; i++) {
        var elCell = document.querySelector(`.cell${gMines[i][0]}-${gMines[i][1]}`);
        elCell.classList.add('mine');
    }
}

function useClue() {
    if (!gGame.isOn) return;
    document.querySelector('.clues').classList.toggle('clues-blink');
    isClue = !isClue;
}

function revealClue(elCell, i, j) {
    if (gLevel.CLUES-- === 0) {
        document.querySelector('.clues').innerText = ' ';
    } else {

        document.querySelector('.clues').innerText = CLUE.repeat(gLevel.CLUES);
        revealNegs(i, j);
    }
}

function hideClue(elCell, i, j) {
    useClue();
    for (var cellI = i - 1; cellI <= i + 1; cellI++) {
        if (cellI < 0 || cellI >= gBoard.length) continue;
        for (var cellJ = j - 1; cellJ <= j + 1; cellJ++) {
            if (cellJ < 0 || cellJ >= gBoard[0].length) continue;
            //if (cellI === i && cellJ === j) continue;
            var val = gBoard[cellI][cellJ];
            // if (isClue) {
            // if (val.isMine) {
            document.querySelector(`.cell${cellI}-${cellJ}`).classList.remove('mine');
            // }
            // } else {
            // if (val.isMine) continue;
            // gBoard[cellI][cellJ].isShown = true;
            // }
            if (val.isHinted && !val.isShown) {
                renderCellText(cellI, cellJ, 0);
                document.querySelector(`.cell${cellI}-${cellJ}`).classList.remove('empty');
            }
            // revealNegs(i + 1, j + 1);
        }
    }
}

function getHighScores() {
    gHighScores.sort();
    if (gHighScores.length > 5) gHighScores.splice(5);
    var highscoresHTML = '';
    for (var i = 0; i < gHighScores.length; i++) {
        highscoresHTML += '<li>' + gHighScores[i] + '</li>';
    }
    return highscoresHTML;
}