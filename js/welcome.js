// Functions declarations
function greetuser() {
    const date = new Date();
    const hour = date.getHours();
    let text = 'Morning';
  // to Greet any user that come to play the game
    if (hour >= 16) {
      text = 'Evening Player Are You Ready for Me';
    } else if (hour >= 12) {
      text = 'Afternoon Player Are You Ready for Me';
    }
  
    $('#greetingsText').text(`Good ${text}!`);
  }
  
  // i start the colour selection function
  function getColors(isAll) {
    const cards = $(isAll ? '.color-card' : '.color-card.selected-color');
    const colors = [];
  
    for (const c of cards) {
      const card = $(c);
      const color = card.attr('id').substr('card-'.length);
  
      colors.push(color);
    }
  
    return colors;
  }
  // note the following here
  // oncolourchange will get the clour from 
  // get colour function which is passed into the colour array

  function onColorChange(id) {
    const selectedColors = getColors();
    const newColor = id.substr('card-'.length);
  
    if (selectedColors.includes(newColor)) {
      $(`#${id}`).removeClass('selected-color');
    } else if (selectedColors.length == 2) {
      toggleErrorMsg('Cannot select more than 2 colors');
    } else {
      $(`#${id}`).addClass('selected-color');
    }
  }
  
  function toggleErrorMsg(msg, duration) {
    $('#errorMsg').text(msg);
  
    if (msg !== '') {
      setTimeout(() => {
        $('#errorMsg').text('');
      }, duration || 4000);
    }
  }
  
  $('#openGameBtn').click(() => {
    const playType = $('input[name=playTypeSelection]:checked').val();
  
    if (playType === 'human') {
      $('#player2Label').text('Name of player2');
  
      $('#player2Input').val('');
      $('#player2Input').prop('disabled', false);
    } else {
      $('#player2Label').text('Computer name');
  
      $('#player2Input').val('Computer');
      $('#player2Input').prop('disabled', true);
    } 

  
    $('#gameSetupModal').modal('show');
  });
  
  console.log('kingsley'.match(/[&?]/));
  
  $('#startGameBtn').click(() => {
    toggleErrorMsg('');
  
    const selectedColors = getColors();
    if (selectedColors.length != 2) {
      toggleErrorMsg('Two colors must be selected before starting this game');
      return;
    }
  
    const player1 = $('#player1Input').val();
    const player2 = $('#player2Input').val();
  
    if (!player1 || !player2) {
      toggleErrorMsg('Both player names must be privided to play this game');
      return;
    }
  
    if (player1 === player2) {
      toggleErrorMsg('Both player names cannot be same');
      return;
    }
  
    if (player1.match(/[&?,]/) || player2.match(/[&?,]/)) {
      toggleErrorMsg('Player name contains invalid character(s)');
      return;
    }
  
    const playType = $('input[name=playTypeSelection]:checked').val();
  
    // save config in localstorage
    const saveValue = {
      playerNames: [player1, player2],
      type: playType,
      selectedColors,
      allColors: getColors(true),
    }
  
    localStorage.setItem('game_saveItem', JSON.stringify(saveValue));
  
    // route to game play screen
    window.location.href = 'board.html';
  });
  
  // Functions executions
  greetuser();
  