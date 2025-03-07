import { useState } from "react";

class Move {
  value: string;
  location: string;
  squares: string[];
  constructor(value: string, location: string, squares: string[]) {
    this.value = value;
    this.location = location;
    this.squares = squares;
  }

  nextMove(idx: number, value: string): Move {
    const newLocation = `(${Math.floor(idx / 3) + 1},${(idx % 3) + 1})`;
    const nextSquares = this.squares.slice();
    nextSquares[idx] = value;
    return new Move(value, newLocation, nextSquares);
  }
}

function Square({ value, highlight, onSquareClick }) {
  return (
    <button
      className={`square ${highlight ? "highlight" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, currentMove, onPlay }) {
  function handleClick(i) {
    if (
      currentMove.squares[i] ||
      calculateWinner(currentMove.squares).length > 0
    ) {
      return;
    }
    const nextMove = currentMove.nextMove(i, xIsNext ? "X" : "O");
    onPlay(nextMove);
  }

  const winningSquares = calculateWinner(currentMove.squares);
  const winner =
    winningSquares.length > 0 ? currentMove.squares[winningSquares[0]] : null;
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (currentMove.squares.every((val) => val !== null)) {
    status = "It's a draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  let boardRows = Array.from({ length: 3 }, (_, r) => {
    const reactSquares = Array.from({ length: 3 })
      .map((_, c) => r * 3 + c)
      .map((idx, _) => (
        <Square
          key={idx}
          value={currentMove.squares[idx]}
          highlight={winningSquares.includes(idx)}
          onSquareClick={() => handleClick(idx)}
        />
      ));
    return (
      <div key={r} className="board-row">
        {reactSquares}
      </div>
    );
  });

  return (
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  );
}

function calculateWinner(squares) {
  const lines = [
    // horizontal
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // vertical
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // diagonal
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return [];
}

export default function Game() {
  // Init with initial state which is [null] * 9 (no X's or O's)
  const [history, setHistory] = useState([
    new Move("", "", Array(9).fill(null)),
  ]);
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [reverseMoveOrder, setReverseMoveOrder] = useState(false);
  const currentMove = history[currentMoveIdx];
  const xIsNext = currentMoveIdx % 2 === 0;

  function handlePlay(nextMove) {
    setHistory([...history.slice(0, currentMoveIdx + 1), nextMove]);
    // currentMove still advances by 1.
    setCurrentMoveIdx(currentMoveIdx + 1);
  }

  function jumpTo(moveIdx) {
    setCurrentMoveIdx(moveIdx);
  }

  const moveDescriptions = history.map((move, moveIdx) => {
    let description =
      "Go to move #" + moveIdx + ` -- ${move.value}@${move.location}`;
    if (moveIdx === 0) {
      description = "Go to game start";
    } else if (moveIdx === currentMoveIdx) {
      description =
        "You are at move #" + moveIdx + ` -- ${move.value}@${move.location}`;
    }
    return (
      <li key={moveIdx}>
        <button onClick={() => jumpTo(moveIdx)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          currentMove={currentMove}
          onPlay={handlePlay}
        />
      </div>
      <div className="game-info">
        <button onClick={() => setReverseMoveOrder(!reverseMoveOrder)}>
          Toggle move order
        </button>
        {reverseMoveOrder && <span>(Reversed)</span>}
        <ol reversed={reverseMoveOrder}>
          {reverseMoveOrder ? moveDescriptions.reverse() : moveDescriptions}
        </ol>
      </div>
    </div>
  );
}
