window.onload = function () {
    initField();
};

function print(obj) {
    console.log(JSON.stringify(obj))
}

document.onkeydown = keyBar;

let timeMove = 400;
const delay = 50;
const cellSize = 50;
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const SPACE = 32;
const SETTINGS = 83;
const direction_codes = { LEFT: 1, UP: 2, RIGHT: 3, DOWN: 4 };
const w = window.innerWidth;
const h = window.innerHeight;
const wMenu = 300;
const hMenu = 300;
const initSnakeLen = 3;

let prevKeyCode = RIGHT;
let rows = Math.floor(h / (cellSize));
let cols = Math.floor(w / cellSize);
let cells;
let snake;
let food = [];
let foodEaten = false;
let cntFoodEaten = 0;
let initCntFood;
let immortal;
let boost;
let paused = false;
let menuShow = false;
let timeReduce = 0.8;

const margin_side = Math.floor((w - cellSize * cols) / 2);
const margin_top = Math.floor((h - cellSize * rows) / 2);

function initConfig() {
    if (localStorage.getItem('userConfig') !== null) {
        let userConfigStr = localStorage.getItem('userConfig');
        let userConfig = JSON.parse(userConfigStr);
        initCntFood = userConfig.initCntFood;
        immortal = userConfig.immortal;
        boost = userConfig.boost;
    } else {
        initCntFood = 1;
        immortal = false;
        boost = false;
    }
}

function initSnake() {
    row_mid = Math.floor(rows / 2);
    col_mid = Math.floor(cols / 2);
    head_row = row_mid;
    head_col = col_mid + 1;
    tail_row = row_mid;
    tail_col = col_mid - 1;

    snake = [[head_row, head_col], [row_mid, col_mid], [tail_row, tail_col]];

    cells = document.getElementsByClassName('cell');
    cells[head_row * cols + head_col].classList.add('snake-head', 'snake');
    cells[head_row * cols + col_mid].classList.add('snake');
    cells[head_row * cols + tail_col].classList.add('snake-tail', 'snake');
}

function initFood() {
    for (let i = 0; i < initCntFood; i++) {
        generateFood();
    }
}

function initScore() {
    let field = document.getElementsByClassName('field')[0];
    let cell = document.createElement('div');
    cell.className = 'score';
    cell.style.top = `${0.5 * cellSize}px`;
    cell.style.left = `${(cols - 3) * cellSize}px`;
    cell.style.height = `${1 * cellSize}px`;
    cell.style.width = `${2 * cellSize}px`;
    cell.style.marginLeft = `${margin_side}px`;
    cell.style.marginRight = `${margin_side}px`;
    cell.style.marginTop = `${margin_top}px`;
    cell.style.marginBottom = `${margin_top}px`;
    cell.textContent = `Score: ${cntFoodEaten}`;
    field.appendChild(cell);
}

function initMenu() {
    let menu = document.getElementsByClassName('menu')[0];
    menu.style.top = `${(rows / 2) * cellSize - hMenu / 2}px`;
    menu.style.left = `${(cols / 2) * cellSize - wMenu / 2}px`;
    menu.style.height = `${hMenu}px`;
    menu.style.width = `${wMenu}px`;
    menu.style.marginLeft = `${margin_side}px`;
    menu.style.marginRight = `${margin_side}px`;
    menu.style.marginTop = `${margin_top}px`;
    menu.style.marginBottom = `${margin_top}px`;
    menu.style.visibility = 'visible';

    initConfig();

    let setting = document.createElement('div');
    setting.className = 'setting';
    let setName = document.createElement('div');
    setName.textContent = 'Initial amount of food: ';
    let edit = document.createElement('input');
    edit.id = 'init-food';
    edit.className = 'edit';
    edit.type = 'number';
    edit.min = '1';
    edit.max = '5';
    edit.value = initCntFood;
    setting.appendChild(setName);
    setting.appendChild(edit);
    menu.appendChild(setting);

    setting = document.createElement('div');
    setting.className = 'setting';
    setName = document.createElement('div');
    setName.textContent = 'Increase speed: ';
    let checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.id = 'boost';
    checkBox.className = 'toggle';
    checkBox.checked = boost;
    setting.appendChild(setName);
    setting.appendChild(checkBox);
    menu.appendChild(setting);

    setting = document.createElement('div');
    setting.className = 'setting';
    setName = document.createElement('div');
    setName.textContent = 'Immortality mode: ';
    checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.id = 'immortal';
    checkBox.className = 'toggle';
    checkBox.checked = immortal;
    setting.appendChild(setName);
    setting.appendChild(checkBox);
    menu.appendChild(setting);

    let startButton = document.createElement('button');
    startButton.className = 'start-button';
    startButton.textContent = 'Start';
    startButton.addEventListener('click', startButtonClick);
    menu.appendChild(startButton);
}

function initField() {
    let field = document.getElementsByClassName('field')[0];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.top = `${i * cellSize}px`;
            cell.style.left = `${j * cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.width = `${cellSize}px`;
            cell.style.marginLeft = `${margin_side}px`;
            cell.style.marginRight = `${margin_side}px`;
            cell.style.marginTop = `${margin_top}px`;
            cell.style.marginBottom = `${margin_top}px`;
            field.appendChild(cell);
        }
    }
    initSnake();
    initScore();
    initMenu();
    startInterval();
}

function startButtonClick() {
    let inputCntFood = document.getElementById('init-food');
    initCntFood = parseInt(inputCntFood.value);
    let inputBoost = document.getElementById('boost');
    boost = inputBoost.checked;
    let inputImmortal = document.getElementById('immortal');
    immortal = inputImmortal.checked;

    let userConfig = {
        initCntFood: initCntFood,
        boost: boost,
        immortal: immortal
    };
    localStorage.setItem('userConfig', JSON.stringify(userConfig));
    initConfig();
    initFood();
    let menu = document.getElementsByClassName('menu')[0];
    menu.style.visibility = 'hidden';

}

function drawSnake(head_row = 0, head_col = 0, tail_row = 0, tail_col = 0, cutPos = -1) {
    if (cutPos == -1) {
        head_old = cells[head_row * cols + head_col];
        head_old.classList.remove('snake-head');

        tail_old = cells[tail_row * cols + tail_col];
        tail_old.classList.remove('snake-tail', 'snake');

        [new_head_row, new_head_col] = snake[0];
        cells[new_head_row * cols + new_head_col].classList.add('snake-head', 'snake');

        [new_tail_row, new_tail_col] = snake.at(-1);
        cells[new_tail_row * cols + new_tail_col].classList.add('snake-tail', 'snake');
    }
    else {
        [new_tail_row, new_tail_col] = snake[cutPos - 1];
        cells[new_tail_row * cols + new_tail_col].classList.add('snake-tail');
        for (let i = cutPos; i < snake.length; i++) {
            [row, col] = snake[i];
            cells[row * cols + col].classList.remove('snake-tail', 'snake');
        }
        [new_head_row, new_head_col] = snake[0];
        cells[new_head_row * cols + new_head_col].classList.add('snake');
    }
}

function drawFood(pos, flag = true) {
    if (flag) {
        cells[pos].classList.add('food');
    }
    else {
        cells[pos].classList.remove('food');
    }
}

function drawScore() {
    let cell = document.getElementsByClassName('score')[0];
    cell.textContent = `Score: ${snake.length - initSnakeLen}`;
}

function move(dir) {
    [head_row, head_col] = snake[0];
    if (foodEaten) {
        [tail_row, tail_col] = snake.at(-1);
        foodEaten = false;
    }
    else {
        [tail_row, tail_col] = snake.pop();
    }
    switch (dir) {
        case RIGHT:
            new_head_col = head_col + 1 >= cols ? 0 : head_col + 1;
            snake.unshift([head_row, new_head_col]);
            break;
        case LEFT:
            new_head_col = head_col - 1 < 0 ? cols - 1 : head_col - 1;
            snake.unshift([head_row, new_head_col]);
            break;
        case UP:
            new_head_row = head_row - 1 < 0 ? rows - 1 : head_row - 1;
            snake.unshift([new_head_row, head_col]);
            break;
        case DOWN:
            new_head_row = head_row + 1 >= rows ? 0 : head_row + 1;
            snake.unshift([new_head_row, head_col]);
            break;
    }
    drawSnake(head_row, head_col, tail_row, tail_col);
    drawScore();
}

function generateFood() {
    let snake1d = snake.map(function (x) { return x[0] * cols + x[1]; });
    pos = Math.floor(Math.random() * (rows * cols - snake.length - initCntFood));
    cnt = 0;
    for (i = 0; i < cells.length; i++) {
        if (snake1d.includes(i)) continue;
        if (food.includes(i)) continue;
        if (cnt == pos) {
            drawFood(i);
            break;
        }
        cnt++;
    }
    food.push(i);
}

function deleteFood(pos) {
    var index = food.indexOf(pos);
    food.splice(index, 1);
    drawFood(pos, false);
}

function increaseSpeed() {
    if (boost && cntFoodEaten % 5 == 0) {
        timeMove = timeMove * timeReduce;
    }
}

function eatFood() {
    let snake1d = snake.map(function (x) { return x[0] * cols + x[1]; });
    head_pos = snake1d[0];
    if (food.includes(head_pos)) {
        deleteFood(head_pos);
        generateFood();
        foodEaten = true;
        cntFoodEaten++;
        drawScore();
        increaseSpeed();
    }
}

function cutSnake(pos) {
    let snake1d = snake.map(function (x) { return x[0] * cols + x[1]; });
    var index = snake1d.slice(1).indexOf(pos);
    drawSnake(null, null, null, null, index);
    snake.length = index;
}

function checkLoss() {
    let snake1d = snake.map(function (x) { return x[0] * cols + x[1]; });
    head_pos = snake1d[0];
    if (snake1d.slice(1).includes(head_pos)) {
        if (!immortal) {
            clearInterval(intervalId);
            showLoss();
        }
        else {
            cutSnake(head_pos);
        }

    }
}

function showLoss() {
    alert(`You lost! Your earned ${cntFoodEaten} points. Let's play again?`);
    location.reload();
}

let keyCode = null;
let timeDelay = 0;
let intervalId;

function startInterval() {
    intervalId = setInterval(() => {
        timeDelay += delay;
        if (timeDelay >= timeMove) {
            timeDelay = 0;
            if (keyCode == null) {
                return
            }
            if ([RIGHT, LEFT, UP, DOWN].includes(keyCode)) {
                move(keyCode);
            }
            eatFood();
            checkLoss();
            prevKeyCode = keyCode;
        }
    }, delay);
}

function pause() {
    if (!menuShow) {
        if (!paused) {
            clearInterval(intervalId);
            paused = true;
        }
        else {
            startInterval();
            paused = false;
        }
    }
}

function settings() {
   window.location.reload();
}

function keyBar(e) {
    e = e || window.Event;
    if ([RIGHT, LEFT, UP, DOWN].includes(e.keyCode)) {
        if (e.keyCode == RIGHT && prevKeyCode != LEFT || e.keyCode == LEFT && prevKeyCode != RIGHT ||
            e.keyCode == UP && prevKeyCode != DOWN || e.keyCode == DOWN && prevKeyCode != UP) {
            keyCode = e.keyCode;
        }
    }
    if (e.keyCode == SPACE) {
        pause();
    }
    if (e.keyCode == SETTINGS) {
        settings();
    }
}

