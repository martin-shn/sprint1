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
    secsPassed: 0, //secsPassed: How many seconds passed
    level: 1,
    safeClicks: 3
};

var gUndo;
var gMines;
var gTimer;
var isFirstPress;
var isClue = false;
var gStep;

function initGame() {
    switch (+document.querySelector('input[name="level"]:checked').value) {
        case 1:
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            gLevel.LIVES = 1;
            gLevel.CLUES = 2;
            gGame.level = 1;
            break;
        case 2:
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            gLevel.LIVES = 3;
            gLevel.CLUES = 3;
            gGame.level = 2;
            break;
        case 3:
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            gLevel.LIVES = 3;
            gLevel.CLUES = 3;
            gGame.level = 3;
            break;
    }
    gUndo = [];
    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gGame.safeClicks = 3;


    gMines = [];
    gBoard = [];
    isFirstPress = true;
    buildBoard();
    renderBoard(gBoard);
    gUndo.push(cloneMat(gBoard));
    document.querySelector('.start-button').innerText = STARTBUTTON;
    document.querySelector('.lives').innerText = LIVE.repeat(gLevel.LIVES);
    document.querySelector('.clues').innerText = CLUE.repeat(gLevel.CLUES);
    document.querySelector('.best-scores-list').innerHTML = saveHightScore(true);
    document.querySelector('.flags').innerText = '000';
    clearInterval(gTimer);
    document.querySelector('.txt-timer').innerText = '000';
    gTimer = setInterval(timer, 1000);
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

function addMines(elCell, i, j) {
    randomizeMines(i, j);
    setMines(gBoard, gMines);
    setMinesNegsCount(gBoard);
    isFirstPress = false;
    cellClicked(elCell, i, j);
}

function randomizeMines(i, j) {
    var emptyCells = getEmptyCellInBoard(gBoard);
    var idx = findArrayInArray([i, j], emptyCells);
    emptyCells.splice(idx, 1);
    for (var i = 0; i < gLevel.MINES; i++) {
        var cell = getRandomCell(emptyCells);
        gMines.push(cell);
        emptyCells.splice(findArrayInArray(cell, emptyCells), 1);
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
    printMat(board, '.board');
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMarked) document.querySelector(`.cell${i}-${j}`).classList.add('flag');
            if (board[i][j].isShown && !board[i][j].isMine) document.querySelector(`.cell${i}-${j}`).classList.add('empty');
            if (board[i][j].isShown && board[i][j].isMine) document.querySelector(`.cell${i}-${j}`).classList.add('mine');
            if (board[i][j].isShown && !board[i][j].isMarked && !board[i][j].isMine) renderCellText(i, j, board[i][j].minesAroundCount);
        }
    }
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

    //add game state as last
    gUndo.push(cloneMat(gBoard));
    //update globals
    // gGame.shownCount = 0;
    gGame.markedCount = countFlags();
    document.querySelector('.undo').innerText = `UNDO\n${gUndo.length - 1}`;


    if (gBoard[i][j].isMine) {
        if (gLevel.LIVES > 0) {
            gLevel.LIVES--;
            document.querySelector('.lives').innerText = LIVE.repeat(gLevel.LIVES);
            elCell.classList.add('mine');
            gBoard[i][j].isShown = true;
            gBoard[i][j].isMarked = false;
            checkGameOver();
        } else {
            elCell.classList.add('red');
            revealAllMines();
            gGame.isOn = false;
            checkGameOver();
        }
    } else {
        if (gBoard[i][j].isMarked) {
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
    document.querySelector('.flags').innerText = countFlags();

}

function countFlags() {
    var count = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMarked) count++;
            else if (gBoard[i][j].isShown && gBoard[i][j].isMine) count++;
        }
    }
    return gMines.length - count;
}

function revealNegs(i, j) {
    for (var cellI = i - 1; cellI <= i + 1; cellI++) {
        if (cellI < 0 || cellI >= gBoard.length) continue;
        for (var cellJ = j - 1; cellJ <= j + 1; cellJ++) {
            if (cellJ < 0 || cellJ >= gBoard[0].length) continue;
            var val = gBoard[cellI][cellJ];
            if (isClue) {
                val.isHinted = true;
                if (val.isMine) {
                    document.querySelector(`.cell${cellI}-${cellJ}`).classList.add('mine');
                }
                renderCellText(cellI, cellJ, val.minesAroundCount);
            } else {
                if (val.isMine || val.isShown) continue;
                if (!val.isMarked) gBoard[cellI][cellJ].isShown = true;
                renderCellText(cellI, cellJ, val.minesAroundCount);
                if (val.minesAroundCount === 0) revealNegs(cellI, cellJ);
            }
        }
    }
}

function cellMarked(elCell, i, j) {
    // Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
    if (!gGame.isOn || isFirstPress) return;
    if (gBoard[i][j].isShown) return;

    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        elCell.classList.remove('flag');
        document.querySelector('.flags').innerText++;
    } else {
        if (document.querySelector('.flags').innerText !== "0") {
            gBoard[i][j].isMarked = true;
            gGame.markedCount++;
            elCell.classList.add('flag');
            document.querySelector('.flags').innerText--;
        }
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
                if (!gBoard[i][j].isMarked && !gBoard[i][j].isShown) {
                    return;
                }
            }
        }
        console.log('WIN!');
        gGame.isOn = false;
        clearInterval(gTimer);
        gGame.secsPassed = +document.querySelector('.txt-timer').innerText;
        var highScoreHTML = saveHightScore(false);
        document.querySelector('.best-scores-list').innerHTML = highScoreHTML;
        document.querySelector('.start-button').innerText = WIN;
    }
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
    if (gLevel.CLUES-- <= 0) {
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
            var val = gBoard[cellI][cellJ];
            document.querySelector(`.cell${cellI}-${cellJ}`).classList.remove('mine');
            if (val.isHinted && !val.isShown) {
                renderCellText(cellI, cellJ, 0);
                document.querySelector(`.cell${cellI}-${cellJ}`).classList.remove('empty');
            }
        }
    }
}

function saveHightScore(isReadOnly) {
    var local = localStorage.getItem(gGame.level);
    if (isReadOnly) {
        if (!local) return '';
        var prevScores = local.split(",").map(function (item) { return parseInt(item); });
    } else {
        if (!local) var prevScores = [];
        else var prevScores = local.split(",").map(function (item) { return parseInt(item); });
        prevScores.push(+gGame.secsPassed);
    }
    prevScores.sort(function (a, b) { return a - b; });
    if (prevScores.length > 5) prevScores.splice(5);
    localStorage.setItem(gGame.level, prevScores);
    var highscoresHTML = '';
    for (var i = 0; i < prevScores.length; i++) {
        highscoresHTML += '<li>' + prevScores[i] + '</li>';
    }
    return highscoresHTML;
}

function clearHighScores() {
    localStorage.setItem(gGame.level, '');
    document.querySelector('.best-scores-list').innerHTML = '';
}

function undo(elBtn) {
    if (!gGame.isOn) return;
    if (gUndo.length === 1 || isFirstPress) return;
    elBtn.classList.add('btn-blinker');
    setTimeout(function () {
        elBtn.classList.remove('btn-blinker');
    }, 2000);
    //load last state and pop it
    if (gUndo.length > 1) gBoard = cloneMat(gUndo.pop());
    //render the new state to screen
    renderBoard(gBoard);
    gGame.markedCount = countFlags();
    document.querySelector('.flags').innerText = countFlags();
    elBtn.innerText = `UNDO\n${gUndo.length - 1}`;

}

function safeclick(elBtn) {
    if (!gGame.isOn || isFirstPress || gGame.safeClicks <= 0) return;
    elBtn.classList.add('btn-blinker');
    setTimeout(function () {
        elBtn.classList.remove('btn-blinker');
    }, 2000);

    var emptyCells = getEmptyCellInBoard(gBoard);
    if (emptyCells.length === 0) return;
    var idx = getRandomCell(emptyCells);
    document.querySelector(`.cell${idx[0]}-${idx[1]}`).classList.toggle('safe-clicked');
    gGame.safeClicks--;
    elBtn.innerText = `SAFE CLICK\n${gGame.safeClicks} Left`;
    setTimeout(() => {
        document.querySelector(`.cell${idx[0]}-${idx[1]}`).classList.toggle('safe-clicked');
    }, 1000);

}