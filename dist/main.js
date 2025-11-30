"use strict";
const content = document.querySelector(".grid");
const cell_Size = document.querySelector('.size_button');
const cell_Color = document.querySelector('.color_button');
const reset = document.querySelector('.reset_button');
const grayscale = document.querySelector('.grayscale');
const rand_color = document.querySelector('.rand_color');
const undoBtn = document.querySelector('.undo_button');
const redoBtn = document.querySelector('.redo_button');
if (!content || !cell_Size || !cell_Color || !reset || !grayscale) {
    throw new Error("Missing required input");
}
//assigning types is mandatory
let gridSize = parseInt(cell_Size.value);
let isDrawing = false;
let isGray = false;
let actionStarted = false;
let undoStack = [];
let redoStack = [];
const getGridState = () => {
    const cells = content.querySelectorAll('.cell');
    return Array.from(cells).map(cell => ({
        color: cell.style.backgroundColor || '',
        filter: cell.style.filter || 'none'
    }));
};
const setGridState = (state) => {
    const cells = content.querySelectorAll('.cell');
    cells.forEach((cell, i) => {
        const s = state[i] || { color: '', filter: 'none' };
        cell.style.backgroundColor = s.color;
        cell.style.filter = s.filter;
    });
};
const pushUndoState = () => {
    undoStack.push(getGridState().map(s => (Object.assign({}, s))));
    redoStack.length = 0;
    updateButtons();
};
const updateButtons = () => {
    if (undoBtn)
        undoBtn.disabled = undoStack.length === 0;
    if (redoBtn)
        redoBtn.disabled = redoStack.length === 0;
};
//
function paintCell(cell) {
    if (!isDrawing)
        return;
    cell.style.backgroundColor = cell_Color.value;
    if (isGray) {
        cell.style.filter = "grayscale(100%)";
    }
    else {
        cell.style.filter = "none";
    }
}
function clickCell(cell) {
    cell.style.backgroundColor = cell_Color.value;
    if (isGray) {
        cell.style.filter = "grayscale(100%)";
    }
    else {
        cell.style.filter = "none";
    }
}
//Grayscale
function grayscaleOverlay() {
    console.log("Gray");
    isGray = !isGray;
    document.querySelectorAll('.cell').forEach(cell => {
        //ternary operator
        cell.style.filter = isGray ? "grayscale(100%)" : "none";
    });
    if (isGray) {
        cell_Color.style.filter = "grayscale(100%)";
        cell_Color.style.opacity = "0.6";
    }
    else {
        cell_Color.style.filter = "none";
        cell_Color.style.opacity = "1";
    }
}
//
function createGrid() {
    content.style.setProperty("--size", String(gridSize));
    content.innerHTML = '';
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.addEventListener('mousedown', e => {
            e.stopPropagation();
            if (!actionStarted) {
                pushUndoState();
                actionStarted = true;
            }
            paintCell(cell);
            isDrawing = true;
        });
        cell.addEventListener('mouseenter', () => {
            if (isDrawing)
                paintCell(cell);
        });
        content.appendChild(cell);
    }
    undoStack = [getGridState().map(s => (Object.assign({}, s)))];
    redoStack = [];
    updateButtons();
}
function generateHEX() {
    var col = Math.floor(Math.random() * 256);
    if (Math.log(col) < 2)
        return col.toString(16) + col.toString(16);
    //type conversion
    else
        return col.toString(16);
}
function randColor() {
    const r = generateHEX();
    const g = generateHEX();
    const b = generateHEX();
    //string interpolation
    let color = `#${r}${g}${b}`;
    cell_Color.value = color;
    console.log(color);
}
if (undoBtn) {
    undoBtn.addEventListener('click', () => {
        if (undoStack.length === 0)
            return;
        redoStack.push(getGridState().map(s => (Object.assign({}, s))));
        const prev = undoStack.pop();
        setGridState(prev);
        updateButtons();
    });
}
if (redoBtn) {
    redoBtn.addEventListener('click', () => {
        if (redoStack.length === 0)
            return;
        undoStack.push(getGridState().map(s => (Object.assign({}, s))));
        const next = redoStack.pop();
        setGridState(next);
        updateButtons();
    });
}
window.addEventListener('mousedown', () => {
    isDrawing = true;
});
window.addEventListener('mouseup', () => {
    isDrawing = false;
});
function resetGrid() {
    createGrid();
}
reset.addEventListener('click', resetGrid);
cell_Size.addEventListener('change', () => {
    gridSize = parseInt(cell_Size.value);
    resetGrid();
});
grayscale.addEventListener('click', grayscaleOverlay);
rand_color.addEventListener('click', randColor);
createGrid();
updateButtons();
