let saveValue;

try {
    saveValue = JSON.parse(localStorage.getItem('game_saveItem'));

  if (!saveValue) {
    throw Error('save Value object not found');
  }

  console.log(saveValue);
} catch (e) {
  window.location.href = 'welcome.html';
}

//  the default game options
const isComputer = saveValue.type !== 'human';
let diceRollsCount = 0;
let player1Turn = true;
const numberOfRounds = 60;
const options = {
  player1: {
    initialSix: false,
    score: 0,
    colors: saveValue.selectedColors
  },
  player2: {
    initialSix: false,
    score: 0,
    colors: saveValue.allColors.filter(c => saveValue.selectedColors.indexOf(c) < 0),
  }
};

// function declarations
function initialize() {
  $('#player1Name').text(saveValue.playerNames[0]);
  $('#player2Name').text(saveValue.playerNames[1]);

  $('#player1Container>.color-card>.color1').css('background-color', options.player1.colors[0]);
  $('#player1Container>.color-card>.color2').css('background-color', options.player1.colors[1]);

  $('#player2Container>.color-card>.color1').css('background-color', options.player2.colors[0]);
  $('#player2Container>.color-card>.color2').css('background-color', options.player2.colors[1]);

  $('#statusActionText').text(isComputer ? 'Click role dice button to start the game' : `${saveValue.playerNames[0]} should role dice to start`);
}

function rollDice() {
  return new Promise((resolve) => {
    const dice = [...document.querySelectorAll(".die-list")];
    const values = [];

    for (const die of dice) {
      toggleClasses(die);
      die.dataset.roll = getRandomNumber(1, 6);

      values.push(parseInt(die.dataset.roll));
    }

    setTimeout(() => {
      resolve(values);
    }, 1500);
  });
}

function toggleClasses(die) {
  die.classList.toggle("odd-roll");
  die.classList.toggle("even-roll");
}


function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function handleGameStartText(msg) {
  return new Promise(resolve => {
    $('#statusActionText').text(msg);

    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

function handleGameResults() {
  let msg = '';

  if (options.player1.score === options.player2.score) {
    msg = `The game ended in a draw with both parties scoring ${options.player1.score} points`;
  } else {
    const winner = options.player1.score > options.player2.score ? saveValue.playerNames[0] : saveValue.playerNames[1];
    const score = options.player1.score > options.player2.score ? options.player1.score : options.player2.score;

    msg = `${winner} is the winner of this game with a score of ${score} points`;
  }

  $("#gameResult").removeClass('d-none');
  $("#gameResultText").text(msg);
  $("#progressTxt").text('Game ended');
  $("#gamePlay").addClass('d-none');

  localStorage.clear();
}

async function handleRollDice() {
  $('#roleDiceBtn').prop('disabled', true);

  let values = await rollDice();

  const score = values.reduce((prev, cur) => prev + cur, 0);

  if (diceRollsCount > 0) {
    diceRollsCount++;
  }

  if (values.includes(6)) {
    if (diceRollsCount === 0 || (player1Turn && !options.player1.initialSix)) {
      diceRollsCount = 1;

      const msg = player1Turn && !options.player1.initialSix
        ? 'Congrats! you just got your first 6!'
        : !player1Turn && !options.player2.initialSix ? `${saveValue.playerNames[1]} just got first 6!` : '';

      if (msg) {
        await handleGameStartText(msg);
      }
    }

    if (player1Turn) {
      options.player1.initialSix = true;
      $('#player1Badge').removeClass('bg-secondary').addClass('bg-success');
    } else {
      options.player2.initialSix = true;
      $('#player2Badge').removeClass('bg-secondary').addClass('bg-success');
    }

    if (score === 12) {
      const msg = player1Turn && !options.player1.initialSix
        ? 'Congrats! you just obtained a double 6'
        : `${saveValue.playerNames[1]} just obtained a double 6`;

      diceRollsCount--;

      await handleGameStartText(msg);
    }
  }

  $('#diceRollCountElem').text(diceRollsCount.toString());

  if (diceRollsCount === 0) {
    const name = player1Turn ? isComputer ? 'You' : saveValue.playerNames[0] : saveValue.playerNames[1];
    $('#statusActionText').text(`${name} did not obtain a 6`);
  } else {
    // add score for user if gotten initialSix already
    if ((player1Turn && options.player1.initialSix) || (!player1Turn && options.player2.initialSix)) {
      if (player1Turn) {
        options.player1.score += score;
      } else {
        options.player2.score += score;
      }

      $('#playerScore1').text(options.player1.score);
      $('#playerScore2').text(options.player2.score);
    }
  }

  if (diceRollsCount === numberOfRounds) {
    handleGameResults();
    return;
  }

  setTimeout(() => {
    if (score !== 12) {
      player1Turn = !player1Turn;
    }

    const turn = player1Turn ? isComputer
      ? 'your' : saveValue.playerNames[0] + '\'s'
      : saveValue.playerNames[1] + '\'s';

    $('#statusActionText').text(`It's ${turn} turn to roll the dice`);

    if (isComputer && !player1Turn) {
      setTimeout(() => {
        handleRollDice();
      }, 1000);
    } else {
      $('#roleDiceBtn').prop('disabled', false);
    }
  }, diceRollsCount === 0 ? 2000 : 1);

}

// executions
initialize();

$('#roleDiceBtn').click(handleRollDice);
