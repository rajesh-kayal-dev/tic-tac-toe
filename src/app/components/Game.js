'use client';
import React, { useState, useEffect } from 'react';
import Board from './Board';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faRobot } from '@fortawesome/free-solid-svg-icons';

const Game = () => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [userSymbol, setUserSymbol] = useState(null);
  const [aiSymbol, setAiSymbol] = useState(null);
  const [userName, setUserName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [winnerLine, setWinnerLine] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer;
    if (countdown > 0 && userSymbol) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && userSymbol) {
      setGameStarted(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, userSymbol]);

  useEffect(() => {
    if (userSymbol && !xIsNext && !calculateWinner(squares)) {
      const bestMove = findBestMove(squares, aiSymbol);
      if (bestMove !== null) {
        handleClick(bestMove, false);
      }
    }
  }, [xIsNext, squares, userSymbol]);

  const handleClick = (index, isUser = true) => {
    const newSquares = squares.slice();
    if (calculateWinner(newSquares) || newSquares[index]) return;
    newSquares[index] = isUser ? userSymbol : aiSymbol;
    setSquares(newSquares);
    setXIsNext(!isUser);

    const result = calculateWinner(newSquares);
    if (result) {
      setWinnerLine(result.line);
      setTimeout(() => {
        Swal.fire({
          title: result.winner === userSymbol
            ? `${userName}, Congratulations you are the winner! 🥇`
            : `You lost. Don’t worry, try again ☺️`,
          text: result.winner !== userSymbol ? "Here's a tip: Try to block your opponent's winning line!" : '',
          icon: result.winner === userSymbol ? 'success' : 'error',
          showCancelButton: result.winner !== userSymbol,
          confirmButtonText: result.winner === userSymbol ? 'OK' : 'Continue',
          cancelButtonText: result.winner !== userSymbol ? 'Exit' : '',
          background: '#002b36',
          color: '#93a1a1'
        }).then((result) => {
          if (result.isConfirmed) {
            resetGame();
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: `Bye bye! Take care you and your family. Thanks for playing this game!`,
              icon: 'info',
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
              background: '#002b36',
              color: '#93a1a1'
            }).then(() => {
              if (window.close) {
                window.close();
                if (!window.closed) {
                  window.location.href = 'about:blank';
                }
              }
            });
          }
        });
      }, 1000); // 1 second delay
    } else if (newSquares.every(square => square !== null)) {
      Swal.fire({
        title: 'It\'s a draw!',
        text: 'Try again or exit.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Try Again',
        cancelButtonText: 'Exit',
        background: '#002b36',
        color: '#93a1a1'
      }).then((result) => {
        if (result.isConfirmed) {
          resetGame();
        } else {
          Swal.fire({
            title: `Bye bye! Take care you and your family. Thanks for playing this game!`,
            icon: 'info',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            background: '#002b36',
            color: '#93a1a1'
          }).then(() => {
            if (window.close) {
              window.close();
              if (!window.closed) {
                window.location.href = 'about:blank';
              }
            }
          });
        }
      });
    }
  };

  const handleUserSymbolSelection = (symbol) => {
    setUserSymbol(symbol);
    setAiSymbol(symbol === 'X' ? 'O' : 'X');
    setXIsNext(symbol === 'X');
    setCountdown(5);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const nameInput = e.target.elements.name;
    setUserName(nameInput.value);
  };

  const findBestMove = (squares, symbol) => {
    const emptySquares = squares.map((square, index) => square === null ? index : null).filter(val => val !== null);

    let bestMove = null;
    let bestScore = -Infinity;

    for (let i = 0; i < emptySquares.length; i++) {
      const move = emptySquares[i];
      squares[move] = symbol;
      const score = minimax(squares, false);
      squares[move] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  };

  const minimax = (squares, isMaximizing) => {
    const result = calculateWinner(squares);
    if (result) {
      return result.winner === aiSymbol ? 10 : -10;
    }

    const emptySquares = squares.map((square, index) => square === null ? index : null).filter(val => val !== null);
    if (emptySquares.length === 0) return 0;

    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (let i = 0; i < emptySquares.length; i++) {
      const move = emptySquares[i];
      squares[move] = isMaximizing ? aiSymbol : userSymbol;
      const score = minimax(squares, !isMaximizing);
      squares[move] = null;
      bestScore = isMaximizing ? Math.max(score, bestScore) : Math.min(score, bestScore);
    }

    return bestScore;
  };

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setWinnerLine(null);
    setGameStarted(false);
    setCountdown(5);
  };

  return (
    <div className="game">
      {!userName ? (
        <form onSubmit={handleNameSubmit} className="name-form">
          <label>
            Name:
            <input type="text" name="name" placeholder="Enter your name" required />
            <button type="submit">Submit</button>
          </label>
        </form>
      ) : !userSymbol ? (
        <div className="symbol-selection">
          <h2>Hello, {userName}! Please select your symbol:</h2>
          <button onClick={() => handleUserSymbolSelection('X')}>X</button>
          <button onClick={() => handleUserSymbolSelection('O')}>O</button>
        </div>
      ) : !gameStarted ? (
        <div className="countdown">
          <h2>Game is starting, please wait a moment...</h2>
          <h3>{countdown}</h3>
        </div>
      ) : (
        <div>
          <div className="status">
            {winnerLine ? `Winner: ${squares[winnerLine[0]]}` : `Next player: ${xIsNext ? 'X' : 'O'}`}
          </div>
          <Board squares={squares} onClick={handleClick} winnerLine={winnerLine} />
          <div className="icon-container">
            <FontAwesomeIcon icon={faUser} className="icon" style={{ color: '#93a1a1' }} />
            <FontAwesomeIcon icon={faRobot} className="icon" style={{ color: '#93a1a1' }} />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default Game;
  