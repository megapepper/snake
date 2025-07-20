window.onload = function () {
    initField();
};

function print(obj) {
    console.log(JSON.stringify(obj))
}

document.onkeydown = directions;

const cell_size = 50;
const time_move = 100;

const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const direction_codes = { LEFT: 1, UP: 2, RIGHT: 3, DOWN: 4 };
const snake_part = { 'head': 1, 'snake': 2, 'tail': 3 };

const w = window.innerWidth;
const h = window.innerHeight;

let rows = Math.floor(h / (cell_size));
let cols = Math.floor(w / cell_size);
let matrix = Array.from({ length: rows }, () => new Array(cols).fill(0));
let cells;
let snake;
let food;
let foodEaten = false;
let cntFood = 0;

const margin_side = Math.floor((w - cell_size * cols) / 2);
const margin_top = Math.floor((h - cell_size * rows) / 2);


function initSnake() {
    row_mid = Math.floor(rows / 2);
    col_mid = Math.floor(cols / 2);
    head_row = row_mid;
    head_col = col_mid + 1;
    tail_row = row_mid;
    tail_col = col_mid - 1;

    snake = [[head_row, head_col], [row_mid, col_mid], [tail_row, tail_col]];
    snake1d = snake.map(function (x) { return x[0] * cols + x[1]; });

    cells = document.getElementsByClassName('cell');
    cells[head_row * cols + head_col].classList.add('snake-head', 'snake');
    cells[head_row * cols + col_mid].classList.add('snake');
    cells[head_row * cols + tail_col].classList.add('snake-tail', 'snake');
}

function initField() {
    let field = document.getElementsByClassName('field')[0];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.top = `${i * cell_size}px`;
            cell.style.left = `${j * cell_size}px`;
            cell.style.height = `${cell_size}px`;
            cell.style.width = `${cell_size}px`;
            cell.style.marginLeft = `${margin_side}px`;
            cell.style.marginRight = `${margin_side}px`;
            cell.style.marginTop = `${margin_top}px`;
            cell.style.marginBottom = `${margin_top}px`;
            field.appendChild(cell);
        }
    }
    initSnake();
    generateFood();
}

function drawSnake(head_row, head_col, tail_row, tail_col) {
    head_old = cells[head_row * cols + head_col];
    head_old.classList.remove('snake-head');

    tail_old = cells[tail_row * cols + tail_col];
    tail_old.classList.remove('snake-tail', 'snake');

    [new_head_row, new_head_col] = snake[0];
    cells[new_head_row * cols + new_head_col].classList.add('snake-head', 'snake');

    [new_tail_row, new_tail_col] = snake.at(-1);
    cells[new_tail_row * cols + new_tail_col].classList.add('snake-tail', 'snake');
}

function drawFood(pos) {
    cells[pos].classList.add('food');
}

function move_right() {
    [head_row, head_col] = snake[0];
    if (foodEaten) {
        [tail_row, tail_col] = snake.at(-1);
        foodEaten = false;
    }
    else {
        [tail_row, tail_col] = snake.pop();
    }

    new_head_col = head_col + 1 >= cols ? 0 : head_col + 1;
    snake.unshift([head_row, new_head_col]);

    drawSnake(head_row, head_col, tail_row, tail_col);
}

function move_left() {
    [head_row, head_col] = snake[0];
    if (foodEaten) {
        [tail_row, tail_col] = snake.at(-1);
        foodEaten = false;
    }
    else {
        [tail_row, tail_col] = snake.pop();
    }

    new_head_col = head_col - 1 < 0 ? cols - 1 : head_col - 1;
    snake.unshift([head_row, new_head_col]);

    drawSnake(head_row, head_col, tail_row, tail_col);
}

function move_up() {
    [head_row, head_col] = snake[0];
    if (foodEaten) {
        [tail_row, tail_col] = snake.at(-1);
        foodEaten = false;
    }
    else {
        [tail_row, tail_col] = snake.pop();
    }

    new_head_row = head_row - 1 < 0 ? rows - 1 : head_row - 1;
    snake.unshift([new_head_row, head_col]);

    drawSnake(head_row, head_col, tail_row, tail_col);
}

function move_down() {
    [head_row, head_col] = snake[0];
    if (foodEaten) {
        [tail_row, tail_col] = snake.at(-1);
        foodEaten = false;
    }
    else {
        [tail_row, tail_col] = snake.pop();
    }

    new_head_row = head_row + 1 >= rows ? 0 : head_row + 1;
    snake.unshift([new_head_row, head_col]);

    drawSnake(head_row, head_col, tail_row, tail_col);
}

function generateFood() {
    let snake1d = snake.map(function (x) { return x[0] * cols + x[1]; });
    pos = Math.floor(Math.random() * (rows * cols - snake.length));
    cnt = 0;
    for (i = 0; i < cells.length; i++) {
        if (snake1d.includes(i)) continue;
        if (cnt == pos) {
            drawFood(i);
            break;
        }
        cnt++;
    }
    food = i;
}

function deleteFood(pos) {
    cells[pos].classList.remove('food');
}

function checkFoodEaten() {
    let snake1d = snake.map(function (x) { return x[0] * cols + x[1]; });
    head_pos = snake1d[0];
    if (head_pos == food) {
        deleteFood(food);
        generateFood();
        foodEaten = true;
        cntFood++;
    }
}

function checkLoss() {
    let snake1d = snake.map(function (x) { return x[0] * cols + x[1]; });
    head_pos = snake1d[0];
    if (snake1d.slice(1).includes(head_pos)) {
        console.log('LOSS');
        clearInterval(intervalId);
        showLoss();
    }
}

function showLoss() {
    alert(`You lost! Your earned ${cntFood} points. Let's play again?`);
    location.reload();
}

let keyCode = null;
let prevKeyCode = RIGHT;

let intervalId = setInterval(() => {
    if (keyCode == null) {
        return
    }
    if (keyCode == RIGHT) {
        move_right();
    }
    if (keyCode == LEFT) {
        move_left();
    }
    if (keyCode == UP) {
        move_up();
    }
    if (keyCode == DOWN) {
        move_down();
    }
    checkFoodEaten();
    checkLoss();
    prevKeyCode = keyCode;
}, time_move);


function directions(e) {
    e = e || window.Event;
    if ([RIGHT, LEFT, UP, DOWN].includes(e.keyCode)) {
        if (e.keyCode == RIGHT && prevKeyCode != LEFT || e.keyCode == LEFT && prevKeyCode != RIGHT ||
            e.keyCode == UP && prevKeyCode != DOWN || e.keyCode == DOWN && prevKeyCode != UP) {
            keyCode = e.keyCode;
        }

    }
}