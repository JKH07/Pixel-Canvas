const content = document.querySelector<HTMLDivElement>(".grid");
const cell_Size = document.querySelector<HTMLInputElement>('.size_button');
const cell_Color = document.querySelector<HTMLInputElement>('.color_button');
const reset = document.querySelector<HTMLButtonElement>('.reset_button');
const grayscale=document.querySelector<HTMLButtonElement>('.grayscale');
const rand_color=document.querySelector<HTMLButtonElement>('.rand_color');
const undoBtn = document.querySelector<HTMLButtonElement>('.undo_button');
const redoBtn = document.querySelector<HTMLButtonElement>('.redo_button');


if (!content || !cell_Size || !cell_Color || !reset||!grayscale) {
    throw new Error("Missing required input");
    
}
//assigning types is mandatory
let gridSize: number = parseInt(cell_Size.value);
let isDrawing: boolean = false;
let isGray: boolean = false;
let actionStarted = false; 

type CellState = { color: string; filter: string };
let undoStack: CellState[][] = [];
let redoStack: CellState[][] = [];

const getGridState = (): CellState[] => {
    const cells = content.querySelectorAll<HTMLDivElement>('.cell');
    return Array.from(cells).map(cell => ({
      color: cell.style.backgroundColor || '',
      filter: cell.style.filter || 'none'
    }));
  };
 const setGridState = (state: CellState[]) => {
    const cells = content.querySelectorAll<HTMLDivElement>('.cell');
    cells.forEach((cell, i) => {
      const s = state[i] || { color: '', filter: 'none' };
      cell.style.backgroundColor = s.color;
      cell.style.filter = s.filter;
    });
  }; 
  const pushUndoState = () => {
    undoStack.push(getGridState().map(s => ({ ...s })));
    redoStack.length = 0;
    updateButtons();
  };

  const updateButtons = () => {
    if (undoBtn) undoBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
  };
  //
function paintCell(cell: HTMLDivElement): void {
    if (!isDrawing) return;
    cell.style.backgroundColor = cell_Color!.value;
    if (isGray) {
    cell.style.filter = "grayscale(100%)";
  } else {
    cell.style.filter = "none";
  }
}

function clickCell(cell: HTMLDivElement): void {
    cell.style.backgroundColor = cell_Color!.value;
    if (isGray) {
    cell.style.filter = "grayscale(100%)";
  } else {
    cell.style.filter = "none";
  }
}
//Grayscale
function grayscaleOverlay(): void {
    console.log("Gray");
    isGray=!isGray;  
    document.querySelectorAll<HTMLDivElement>('.cell').forEach(cell => {
        //ternary operator
    cell.style.filter = isGray ? "grayscale(100%)" : "none";
  });
  if (isGray) {
    cell_Color!.style.filter = "grayscale(100%)";
    cell_Color!.style.opacity = "0.6";
  } else {
    cell_Color!.style.filter = "none";
    cell_Color!.style.opacity = "1";
  }
}
//
function createGrid(): void {
   content!.style.setProperty("--size", String(gridSize));
    content!.innerHTML = '';

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
        if (isDrawing) paintCell(cell);
      });

      content!.appendChild(cell);
    }
    undoStack = [getGridState().map(s => ({ ...s }))];
    redoStack = [];
    updateButtons();
}
function generateHEX():string{
  var col=Math.floor(Math.random()*256);
  if(Math.log(col)<2)return col.toString(16)+col.toString(16);
  //type conversion
  else return col.toString(16);

}
function randColor():void{
  const r=generateHEX();
  const g=generateHEX();
  const b=generateHEX();
//string interpolation
let color: string=`#${r}${g}${b}`;

 cell_Color!.value=color;
 console.log(color);
}
if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      if (undoStack.length === 0) return;
      redoStack.push(getGridState().map(s => ({ ...s })));
      const prev = undoStack.pop()!;
      setGridState(prev);
      updateButtons();
    });
  }

  if (redoBtn) {
    redoBtn.addEventListener('click', () => {
      if (redoStack.length === 0) return;
      undoStack.push(getGridState().map(s => ({ ...s })));
      const next = redoStack.pop()!;
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

function resetGrid(): void {
    createGrid();
}

reset.addEventListener('click', resetGrid);

cell_Size.addEventListener('change', () => {
    gridSize = parseInt(cell_Size.value);
    resetGrid();
});

grayscale.addEventListener('click', grayscaleOverlay);
rand_color!.addEventListener('click', randColor);

createGrid();
updateButtons();