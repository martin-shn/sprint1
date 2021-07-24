function printMat(mat, selector) {
    var strHTML = '<tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = ' ';
            var className = 'cell cell' + i + '-' + j;
            strHTML += `<td class="${className}" 
            onclick="cellClicked(this,${i},${j})" 
            oncontextmenu="cellMarked(this, ${i}, ${j}); return false;">
                ${cell}
            </td>`;
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody>';
    var elContainer = parseSelector(selector);
    elContainer.innerHTML = strHTML;
}

function shuffle(items) {
    var randIdx, keep, i;
    for (i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, items.length);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}

function parseSelector(element) {
    return document.querySelector(`${element}`);
}

function renderCellText(i, j, value) {
    // Select the elCell and set the value
    var elCell = parseSelector(`.cell${i}-${j}`);
    if (gBoard[i][j].isMarked) return;
    elCell.innerText = value === 0 ? '' : value;
    elCell.classList.add('empty');
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getEmptyCellInBoard(board) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isShown && !board[i][j].isMarked && !board[i][j].isMine)
                emptyCells.push([i, j]);
        }
    }
    return emptyCells;
}

function getRandomCell(emptyCells) {
    if (emptyCells.length === 0) return -1;
    var randomInt = getRandomIntInclusive(0, emptyCells.length - 1);
    var randomCell = emptyCells[randomInt];
    return randomCell;
}

function findArrayInArray(arrayToFind, arrayToSearchIn) {
    for (var i = 0; i < arrayToSearchIn.length; i++) {
        if (arrayToSearchIn[i][0] === arrayToFind[0] && arrayToSearchIn[i][1] === arrayToFind[1])
            return i;
    }
    return -1;
}

function getAllNeighbors(mat, location) {
    var res = [];

    for (var i = location.i - 1; i < mat.length + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = location.j - 1; j < location.j + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            var coord = { i: i, j: j };
            res.push(coord);
        }
    }
    return res;
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = '0' + num;
    return num;
}

function cloneMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = {};
            Object.assign(newMat[i][j], mat[i][j]);
        }
    }
    return newMat;
}
