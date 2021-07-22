'use strict'
var gManualMap;
var gManualMines;

function createManualMap() {
    //clear the current map
    gManualMap = [];
    gManualMines = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        gManualMap[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            gManualMap[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isHinted: false
            }
        }
    }
    //render the empty map on screen
    document.querySelector('.board').innerHTML = getMatHTML(gManualMap);

    //remove create map button and show save map
    hideBtn('create');
    hideBtn('play');
    hideBtn('delete');
    showBtn('save');
    showBtn('cancel');
}

function hideBtn(id) {
    document.querySelector(`#${id}`).style.visibility = 'hidden';
}
function showBtn(id) {
    document.querySelector(`#${id}`).style.visibility = 'visible';
}

function getElementHTML(i, j) {
    return document.querySelector(`.cell${i}-${j}`);
}

function getMatHTML(mat) {
    var strHTML = '<tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            // var cell = mat[i][j];
            var cell = ' ';
            var className = 'cell cell' + i + '-' + j;
            strHTML += `<td class="${className}" onclick="addMine(this,${i},${j})">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody>';
    return strHTML;
}

function addMine(elCell, i, j) {
    if (gManualMap[i][j].isMine) {
        gManualMap[i][j].isMine = false;
        elCell.classList.remove('mine');
    } else {
        gManualMap[i][j].isMine = true;
        elCell.classList.add('mine');
    }
}

function saveMap(elBtn) {
    //loop over board and save all mines to array
    gManualMines = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gManualMap[i][j].isMine) gManualMines.push([i, j]);
        }
    }
    elBtn.innerText = 'Update This Map';
    hideBtn('create');
    showBtn('play');
    showBtn('delete');
    showBtn('save');
    hideBtn('cancel');
}

function deleteMap() {
    gManualMines = [];
    gManualMap = [];
    document.querySelector(`#save`).innerText = 'Save This Map';
    showBtn('create');
    hideBtn('play');
    hideBtn('delete');
    hideBtn('save');
    hideBtn('cancel');
    initGame();
}

function cancelMap() {
    showBtn('create');
    hideBtn('play');
    hideBtn('delete');
    hideBtn('save');
    hideBtn('cancel');
    initGame();
}

function playManualMap() {
    gBoard = [];
    gMines = [];
    gBoard = cloneMat(gManualMap);
    gMines = [...gManualMines];
    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gGame.safeClicks = 3;

    setMines(gBoard, gMines);
    setMinesNegsCount(gBoard);


    isFirstPress = false;
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

    hideBtn('create');
    showBtn('play');
    showBtn('delete');
    hideBtn('save');
    hideBtn('cancel');

}