function printMat(mat, selector) {
    var strHTML = '<tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            // var cell = mat[i][j];
            var cell = ' ';
            var className = 'cell cell' + i + '-' + j;
            strHTML += `<td class="${className}" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this, ${i}, ${j}); return false;">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
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

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
}
function renderCellText(i, j, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${i}-${j}`);
    if (gBoard[i][j].isMarked) return
    elCell.innerText = (value === 0) ? '' : value;
    elCell.classList.add('empty');
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell' + location.i + '-' + location.j;
    return cellClass;
}

function getEmptyCellInBoard(board) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isShown && !board[i][j].isMarked && !board[i][j].isMine) emptyCells.push([i, j]);
        }
    }
    return emptyCells;
}

function getRandomCell(emptyCells) {
    if (emptyCells.length === 0) return -1;
    var randomInt = getRandomIntInclusive(0, emptyCells.length - 1);
    var randomCell = emptyCells[randomInt];
    // emptyCells.splice(randomInt, 1);
    // return { i: randomCell[0], j: randomCell[1] };
    return randomCell;
}

function findArrayInArray(arrayToFind, arrayToSearchIn) {
    for (var i = 0; i < arrayToSearchIn.length; i++) {
        if (arrayToSearchIn[i][0] === arrayToFind[0] && arrayToSearchIn[i][1] === arrayToFind[1]) return i
    }
    return -1;
}

function playSound(sound) {
    var sound = new Audio('/snd/' + sound);
    sound.play();
}

function getAllNeighbors(mat, location) {
    var res = [];

    for (var i = location.i - 1; i < mat.length + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = location.j - 1; j < location.j + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            var coord = { i: i, j: j };
            //var val = mat[i][j];
            res.push(coord);
        }
    }

    return res;
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
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