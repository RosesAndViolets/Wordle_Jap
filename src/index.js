import { testDictionary, realDictionary } from "./dictionary.js";
// import * as wanakana from 'wanakana';

// testing
// console.log('real dictionary:', realDictionary);
const attemptNum = 7;
const dictionary = realDictionary;
const state = {
  secret: dictionary[Math.floor(Math.random() * dictionary.length)],
  grid: Array(attemptNum)
    .fill()
    .map(() => Array(5).fill("")),
  currentRow: 0,
  currentCol: 0,
};
let variations = [];
const dakuonMap = new Map([
  ["か", "が"],
  ["き", "ぎ"],
  ["く", "ぐ"],
  ["け", "げ"],
  ["こ", "ご"],
  ["さ", "ざ"],
  ["し", "じ"],
  ["す", "ず"],
  ["せ", "ぜ"],
  ["そ", "ぞ"],
  ["た", "だ"],
  ["ち", "ぢ"],
  ["つ", "づ"],
  ["て", "で"],
  ["と", "ど"],
  ["は", "ば"],
  ["ひ", "び"],
  ["ふ", "ぶ"],
  ["へ", "べ"],
  ["ほ", "ぼ"],
]);

const handakuonMap = new Map([
  ["は", "ぱ"],
  ["ひ", "ぴ"],
  ["ふ", "ぷ"],
  ["へ", "ぺ"],
  ["ほ", "ぽ"],
]);

const zendakuon = [
  ["か", "が"],
  ["き", "ぎ"],
  ["く", "ぐ"],
  ["け", "げ"],
  ["こ", "ご"],
  ["さ", "ざ"],
  ["し", "じ"],
  ["す", "ず"],
  ["せ", "ぜ"],
  ["そ", "ぞ"],
  ["た", "だ"],
  ["ち", "ぢ"],
  ["つ", "づ"],
  ["て", "で"],
  ["と", "ど"],
  ["は", "ば", "ぱ"],
  ["ひ", "び", "ぴ"],
  ["ふ", "ぶ", "ぷ"],
  ["へ", "べ", "ぺ"],
  ["ほ", "ぼ", "ぽ"],
];

const keyboard = [
  ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ", "ゃ"],
  ["い", "き", "し", "ち", "に", "ひ", "み", "ゆ", "り", "を", "ゅ"],
  ["う", "く", "す", "つ", "ぬ", "ふ", "む", "よ", "る", "ん", "ょ"],
  ["え", "け", "せ", "て", "ね", "へ", "め", "っ", "れ", "゛", "⏎"],
  ["お", "こ", "そ", "と", "の", "ほ", "も", "ー", "ろ", "゜", "⌫"],
];

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

  for (let i = 0; i < attemptNum; i++) {
    for (let j = 0; j < 5; j++) {
      drawBox(grid, i, j);
    }
  }
  container.appendChild(grid);
}
function drawKeyboard() {
  for (let i = 0; i < keyboard.length; i++) {
    let currkeyboardRow = keyboard[i];
    let keyboardRow = document.createElement("div");
    keyboardRow.classList.add("keyboard-row");

    for (let j = 0; j < currkeyboardRow.length; j++) {
      let keyTile = document.createElement("div");

      let key = currkeyboardRow[j];
      keyTile.innerText = key;
      if (key == "Enter") {
        keyTile.id = "Enter";
      } else if (key == "Backspace") {
        keyTile.id = "Backspace";
      } else if (isLetterOnKeyboard(key)) {
        // console.log(keyTile.id);
        keyTile.id = key; //"あ", "い", ...
      }
      keyTile.addEventListener("click", processKey);
      keyTile.classList.add("key-tile");

      keyboardRow.appendChild(keyTile);
    }
    document.body.appendChild(keyboardRow);
  }
}

function processKey() {
  let letter = this.innerText;
  console.log(letter);
  if (letter == "⌫") {
    removeLetter();
  } else if (letter == "゛" || letter == "゜") {
    // console.log("dakuon");
    addDakuon(letter); //TODO
  } else {
    addLetter(letter);
  }
  updateGrid();
}

function addDakuon(letter) {
  const row = state.currentRow;
  const prevcol = state.currentCol - 1;
  const box = document.getElementById(`box${row}${prevcol}`);
  if (!dakuonMap.has(box.textContent)) {
    return;
  }

  if (letter == "゛") {
    const dakuon = dakuonMap.get(box.textContent);
    console.log(dakuon);
    state.grid[row][prevcol] = dakuon;
  } else if (letter == "゜") {
    const handakuon = handakuonMap.get(box.textContent);
    state.grid[row][prevcol] = handakuon;
  }
  updateGrid();
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
      removeLetter();
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

function isLetterOnKeyboard(letter) {
  return (
    keyboard[0].includes(letter) ||
    keyboard[1].includes(letter) ||
    keyboard[2].includes(letter) ||
    keyboard[3].includes(letter) ||
    keyboard[4].includes(letter)
  );
}

function isDakuonFamily(letter) {
  return (
    zendakuon[0].includes(letter) ||
    zendakuon[1].includes(letter) ||
    zendakuon[2].includes(letter) ||
    zendakuon[3].includes(letter) ||
    zendakuon[4].includes(letter) ||
    zendakuon[5].includes(letter) ||
    zendakuon[6].includes(letter) ||
    zendakuon[7].includes(letter) ||
    zendakuon[8].includes(letter) ||
    zendakuon[9].includes(letter) ||
    zendakuon[10].includes(letter) ||
    zendakuon[11].includes(letter) ||
    zendakuon[12].includes(letter) ||
    zendakuon[13].includes(letter) ||
    zendakuon[14].includes(letter) ||
    zendakuon[15].includes(letter) ||
    zendakuon[16].includes(letter) ||
    zendakuon[17].includes(letter) ||
    zendakuon[18].includes(letter) ||
    zendakuon[19].includes(letter)
  );
}

function colorKeyboard(box, category) {
  console.log(box.textContent + " " + category);
  var letter = box.textContent;
  if (category === "right" || category === "wrong" || category === "empty") {
    document.getElementById(`${letter}`).classList.remove("close");
    document.getElementById(`${letter}`).classList.add(category);
  } else if (isDakuonFamily(letter)) {
    letter = removeDakuon(letter);
    console.log("no dakuon" + letter + " " + category);
    document.getElementById(`${letter}`).classList.add(category);
  }
}

function getVariations(letter) {
  if (!isDakuonFamily(letter)) return "";
  var temp = [];
  zendakuon.forEach((row) => {
    if (row.includes(letter)) {
      // console.log(row);
      temp = row;
    }
  });
  return temp;
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
        colorKeyboard(box, "right");
      } else if (state.secret.includes(letter)) {
        box.classList.add("wrong");
        colorKeyboard(box, "wrong");
      } else if (isVariation(letter)) {
        removeDakuon(letter);
        box.classList.add("close");
        colorKeyboard(box, "close");
      } else {
        box.classList.add("empty");
        colorKeyboard(box, "empty");
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

function isVariation(key) {
  var flag = false;
  variations.forEach((fam) => {
    if (fam.includes(key)) {
      console.log("checking if variation");
      flag = true;
    }
  });
  return flag;
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
function removeDakuon(key) {
  var noDakuon;
  variations.forEach((fam) => {
    if (fam.includes(key)) {
      console.log("removing dakuon");
      noDakuon = fam[0];
    }
  });
  return noDakuon;
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
  drawKeyboard();

  registerKeyboardEvents();

  console.log(state.secret);

  for (let i = 0; i < 5; i++) {
    if (isDakuonFamily(state.secret[i])) {
      variations.push(getVariations(state.secret[i]));
      console.log(variations);
    }
  }
}

startup();
