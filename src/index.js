import { testDictionary, realDictionary } from "./dictionary.js";
// import * as wanakana from 'wanakana';

// testing
// console.log('real dictionary:', realDictionary);
const dictionary = realDictionary;
const state = {
  secret: dictionary[Math.floor(Math.random() * dictionary.length)],
  grid: Array(6)
    .fill()
    .map(() => Array(5).fill("")),
  currentRow: 0,
  currentCol: 0,
};

function updateGrid() {
  for (let i = 0; i < state.grid.length; i++) {
    for (let j = 0; j < state.grid[i].length; j++) {
      const box = document.getElementById(`box${i}${j}`);
      box.textContent = state.grid[i][j];
    }
  }
}

function drawBox(container, row, col, letter = "") {
  const box = document.createElement("div");
  box.className = "box";
  box.id = `box${row}${col}`;
  box.textContent = letter;

  container.appendChild(box);
  return box;
}

function drawGrid(container) {
  const grid = document.createElement("div");
  grid.className = "grid";

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      drawBox(grid, i, j);
    }
  }
  container.appendChild(grid);
}
function registerKeyboardEvents() {
  document.body.onkeydown = (e) => {
    const key = e.key;
    // console.log(key);

    if (key === "Enter") {
      if (state.currentCol === 5) {
        for (let i = 0; i < 5; i++) {
          document
            .getElementById(`box${state.currentRow}${i}`)
            .classList.remove("popAnimated");
        }
        const word = getCurrentWord();
        if (isWordValid(word)) {
          revealWord(word);
          state.currentRow++;
          state.currentCol = 0;
        } else {
          alert("登録されていない単語です");
        }
      }
    }
    if (key === "Backspace") {
      removeLetter(); //TODO
    }
    if (state.currentCol === 5) return;
    if (isVowel(key)) {
      var boxContent = state.grid[state.currentRow][state.currentCol];
      // if current column box text content is empty, add letter
      if (boxContent === "") {
        addLetter(key);
      } else {
        boxContent += key;
        addLetter(boxContent);
      }
    } else if (isConsonant(key)) {
      var boxContent = state.grid[state.currentRow][state.currentCol];
      // んの時
      if (boxContent === "n" && key === "n") {
        addLetter("n");
      }
      // っの時
      else if (isConsonant(boxContent) && boxContent === key) {
        addLetter("っ");
        addKey(key);
      }
      // ゃょゅの時
      else if (isConsonant(boxContent) && key === "y") {
        boxContent += key;
        addKey(boxContent);
      }
      // chの時 except ち
      else if ((boxContent === "c" || boxContent === "s") && key === "h") {
        boxContent += key;
        addKey(boxContent);
      } else {
        addKey(key);
      }
    }
    if (key === "-") {
      addLetter("ー");
    }
    updateGrid();
  };
}

function getCurrentWord() {
  return state.grid[state.currentRow].reduce((prev, curr) => prev + curr);
}
function isWordValid(word) {
  return dictionary.includes(word);
}

function revealWord(guess) {
  const row = state.currentRow;
  const animation_duration = 500;

  for (let i = 0; i < 5; i++) {
    const box = document.getElementById(`box${row}${i}`);
    const letter = box.textContent;

    setTimeout(() => {
      if (letter === state.secret[i]) {
        box.classList.add("right");
      } else if (state.secret.includes(letter)) {
        box.classList.add("wrong");
      } else {
        box.classList.add("empty");
      }
    }, ((i + 1) * animation_duration) / 2);

    box.classList.add("animated");
    box.style.animationDelay = `${(i * animation_duration) / 2}ms`;
  }

  const isWinner = state.secret === guess;
  const isGameOver = state.currentRow === 5;

  setTimeout(() => {
    if (isWinner) {
      alert("正解です！ \nおめでとうございます！");
    } else if (isGameOver) {
      alert("ゲームオーバー! 答えは \n\n" + state.secret + "\n\nでした");
    }
  }, 3 * animation_duration);
}

function isVowel(key) {
  if (key.length === 1 && key.match(/[aeiou]/i)) {
    return true;
  } else {
    return false;
  }
}

function isConsonant(key) {
  if (key.length === 1 && key.match(/[bcdfghjklmnpqrstvwxyz]/i)) {
    return true;
  } else {
    return false;
  }
}
function addLetter(letter) {
  const row = state.currentRow;
  const col = state.currentCol;
  const box = document.getElementById(`box${row}${col}`);

  if (state.currentCol === 5) return;
  // if length of letter is >2, tohiragana only the first letter
  const hira = wanakana.toHiragana(letter);
  if (hira.length > 1) {
    if (state.currentCol > 3) {
      return;
    }
    state.grid[state.currentRow][state.currentCol] = hira[0];
    state.currentCol++;
    state.grid[state.currentRow][state.currentCol] = hira[1];
    state.currentCol++;
    const box1 = document.getElementById(`box${row}${col + 1}`);
    box1.classList.add("popAnimated");
  } else {
    state.grid[state.currentRow][state.currentCol] =
      wanakana.toHiragana(letter);
    state.currentCol++;
  }
  box.classList.add("popAnimated");
}

function addKey(key) {
  const row = state.currentRow;
  const col = state.currentCol;
  const box = document.getElementById(`box${row}${col}`);

  if (state.currentCol === 5) return;
  state.grid[state.currentRow][state.currentCol] = key;
}

function removeLetter() {
  // check if current box has text content
  if (
    state.grid[state.currentRow][state.currentCol] !== "" &&
    state.currentCol !== 5
  ) {
    state.grid[state.currentRow][state.currentCol] = "";
    return;
  }

  const row = state.currentRow;
  const col = state.currentCol - 1;
  const box = document.getElementById(`box${row}${col}`);

  if (state.currentCol === 0) return;
  state.grid[row][col] = "";
  state.currentCol--;
  box.classList.remove("popAnimated");
}

function startup() {
  const game = document.getElementById("game");
  drawGrid(game);

  registerKeyboardEvents();

  //   console.log(state.secret);
}

startup();
