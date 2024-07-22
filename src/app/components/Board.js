import React from 'react';

const Board = ({ squares, onClick, winnerLine }) => {
  return (
    <div className="board">
      {squares.map((square, index) => (
        <button
          key={index}
          className={`square ${winnerLine && winnerLine.includes(index) ? 'winner' : ''}`}
          onClick={() => onClick(index)}
        >
          {square}
        </button>
      ))}
    </div>
  );
};

export default Board;
