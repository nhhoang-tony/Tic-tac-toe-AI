import Player from './components/Player';
import Board from './components/Board';
import { useEffect, useState } from 'react';
import { WIN_COMBOS } from '../win-combos';
import GameOver from './components/GameOver';
import { getAiMove, deepCopy, terminal } from './util/AI';

const PLAYERS = {
  X: 'Player 1',
  O: 'Player 2',
};

const X: string = 'X';
const O: string = 'O';

const INITIAL_GAME_BOARD = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

const availableGameModes = {
  player: 'Player goes first',
  ai: 'AI goes first',
  multi: '2 Players',
};

// get player that wins
function getWinner(gameBoard, players) {
  let winner = null;

  for (const combo of WIN_COMBOS) {
    const firstSquare = gameBoard[combo[0].row][combo[0].column];
    const secondSquare = gameBoard[combo[1].row][combo[1].column];
    const thirdSquare = gameBoard[combo[2].row][combo[2].column];

    if (
      firstSquare &&
      firstSquare === secondSquare &&
      firstSquare === thirdSquare
    ) {
      winner = players[firstSquare];
    }
  }

  return winner;
}

function App() {
  const gamePlayButtonClasses =
    'block mx-auto text-2xl bg-none border-solid border-2 border-[#f9e96e] py-2 px-4 cursor-pointer transition-all ease duration-200 shadow-[0_0_8px_rgba(255,187,0,0.4)] hover:bg-[#f1a065fa] hover:text-[#0d1706] hover:shadow-[0_0_20px_rgba(255,187,0,0.8)] active:bg-[#f1a065fa] active:text-[#0d1706] active:shadow-[0_0_20px_rgba(255,187,0,0.8)]';

  const [players, setPlayers] = useState(PLAYERS);
  const [gameBoard, setGameBoard] = useState(deepCopy(INITIAL_GAME_BOARD));
  const [loadingAI, setLoadingAI] = useState(false);
  const [gamePlay, setGamePlay] = useState({
    mode: availableGameModes.multi,
    playerTurn: X,
  });

  const winner = getWinner(gameBoard, players);
  const hasDraw = terminal(gameBoard);

  // player makes a move
  function handleSelectSquare(rowIndex, colIndex) {
    if (gameBoard[rowIndex][colIndex] !== null) {
      return;
    }
    setGameBoard((prevBoard) => {
      let updatedBoard = [...prevBoard];
      updatedBoard[rowIndex][colIndex] = gamePlay.playerTurn;
      return updatedBoard;
    });

    setGamePlay((prevTurn) => {
      let newGamePlay = {
        ...prevTurn,
      };

      if (newGamePlay.playerTurn === X) {
        newGamePlay.playerTurn = O;
      } else {
        newGamePlay.playerTurn = X;
      }

      return newGamePlay;
    });
  }

  // restart game
  function handleRestart() {
    setGameBoard(() => {
      const newGame = deepCopy(INITIAL_GAME_BOARD);
      return newGame;
    });

    setGamePlay((prevState) => {
      let newGamePlay = {
        ...prevState,
      };
      newGamePlay.playerTurn = X;

      return newGamePlay;
    });

    if (gamePlay.mode === availableGameModes.ai) {
      setLoadingAI(true);
      setTimeout(() => {
        setLoadingAI(false);
      }, 1000);
    }
  }

  // player change name
  function handlePlayerNameChange(symbol, newName) {
    setPlayers((prevPlayers) => {
      return {
        ...prevPlayers,
        [symbol]: newName,
      };
    });
  }

  // handle game mode
  function handleGameMode(mode) {
    setGamePlay((prevState) => {
      let newGamePlay = {
        ...prevState,
      };
      newGamePlay.mode = mode;
      newGamePlay.playerTurn = X;

      return newGamePlay;
    });

    if (mode === availableGameModes.ai) {
      handlePlayerNameChange(X, 'AI');
      handlePlayerNameChange(O, 'Player 2');
    } else if (mode === availableGameModes.player) {
      handlePlayerNameChange(X, 'Player 1');
      handlePlayerNameChange(O, 'AI');
    } else {
      handlePlayerNameChange(X, 'Player 1');
      handlePlayerNameChange(O, 'Player 2');
    }
  }

  // restart game after mode changed
  useEffect(() => {
    handleRestart();
  }, [gamePlay.mode]);

  // AI move
  useEffect(() => {
    if (
      gamePlay.playerTurn === O &&
      !terminal(gameBoard) &&
      gamePlay.mode === availableGameModes.player
    ) {
      setTimeout(() => {
        const aiMove = getAiMove(gameBoard);
        handleSelectSquare(aiMove[0], aiMove[1]);
      }, 100);
    } else if (
      gamePlay.playerTurn === X &&
      !terminal(gameBoard) &&
      gamePlay.mode === availableGameModes.ai
    ) {
      setTimeout(() => {
        const aiMove = getAiMove(gameBoard);
        handleSelectSquare(aiMove[0], aiMove[1]);
      }, 100);
    }
  }, [gameBoard, gamePlay.playerTurn]);

  return (
    <main>
      <header className='text-center'>
        <img
          src='/static/img/game-logo.png'
          className='w-40 object-cover mt-4 mb-4 mx-auto'
        ></img>
        <img
          src='/static/img/header.svg'
          className='w-96 max-w-[80%] object-cover mt-4 mb-4 mx-auto'
        ></img>
      </header>
      {loadingAI && (
        <div className='z-10 fixed top-0 left-0 w-full h-full flex flex-col justify-center items-center'>
          <div className='fixed w-full h-screen bg-[#0f0e18] opacity-40 z-0'></div>
          <div className='absolute z-10 bg-[#f1a065fa] rounded border-none p-4 w-[45%] max-w-[45rem] backdrop:bg-black backdrop:opacity-40'>
            <h2 className='text-lg sm:text-xl text-center text-black'>
              Loading AI...
            </h2>
          </div>
        </div>
      )}
      <div className='max-w-[95%] sm:w-[95%] sm:max-w-[45rem] my-8 mx-auto py-8 px-4 sm:px-8 rounded-lg bg-[#12160c] shadow-[0_0_20px_rgba(0,0,0,0.5)] relative text-center'>
        <div className='flex flex-wrap justify-evenly items-center gap-8 p-0 sm:my-4 mx-0'>
          <Player
            initialName={players.X}
            symbol={X}
            currentTurn={gamePlay.playerTurn === X}
            isAi={gamePlay.mode === availableGameModes.ai}
            onChangeName={handlePlayerNameChange}
          ></Player>
          <Player
            initialName={players.O}
            symbol={O}
            currentTurn={gamePlay.playerTurn === O}
            isAi={gamePlay.mode === availableGameModes.player}
            onChangeName={handlePlayerNameChange}
          ></Player>
        </div>
        {(winner || hasDraw) && (
          <GameOver onRestart={handleRestart} winner={winner}></GameOver>
        )}
        <Board onSelectSquare={handleSelectSquare} board={gameBoard}></Board>

        <div className='flex flex-wrap justify-evenly items-center gap-8 p-0 sm:my-4 mx-0'>
          {Object.values(availableGameModes).map((gameMode) => (
            <div key={gameMode} className={`flex items-center w-[250px]`}>
              <button
                className={`w-[250px] ${gamePlayButtonClasses} ${
                  gamePlay.mode === gameMode
                    ? 'bg-[#f1a065fa] text-[#0d1706] shadow-[0_0_20px_rgba(255,187,0,0.8)]'
                    : ''
                }`}
                onClick={() => handleGameMode(gameMode)}
              >
                {gameMode}
              </button>
            </div>
          ))}

          <div className={`flex items-center w-[250px]`}>
            <button
              className={`w-[250px] ${gamePlayButtonClasses}`}
              onClick={handleRestart}
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
