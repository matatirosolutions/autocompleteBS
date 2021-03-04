// To Do - Set ID and Return Object on 'Enter' Press

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function clearListBS() {
  console.log('Clearing List');
  let autocompleteDiv = document.getElementById("autocompleteBS-list");
  if( autocompleteDiv != null ) autocompleteDiv.remove();
}

function addResultsBS(config, results) {
  console.log('Add Results');
  clearListBS();
  const newDiv = document.createElement('div');
  const sourceBS = config.inputSource;

 console.log(sourceBS.id);

  newDiv.classList.add("autocompleteBS-items");
  newDiv.setAttribute('data-forinputbs', sourceBS.id);
  newDiv.setAttribute('data-current', -1);
  newDiv.setAttribute('data-results', results.length);
  // console.log(sourceBS);
  // console.log(sourceBS.parentElement);
  newDiv.id = "autocompleteBS-list";
  let resultCounter = 0;
  
  results.forEach( function(result) {
    console.log(result);
    let listDiv = document.createElement('div');
    let listInput = document.createElement('input');

    listDiv.innerHTML = result.value;

    listInput.id = 'autoBS-' + resultCounter;
    listInput.setAttribute('value', result.value);
    listInput.setAttribute('data-id', result.id);
    listInput.setAttribute('data-resultid', resultCounter);
    listInput.hidden = true;

    // console.log(listInput);

    listDiv.append(listInput);
    newDiv.append(listDiv);
    resultCounter++;
    console.log(newDiv);

  });

    newDiv.addEventListener("click", function(e) {
      console.log('Selection Click Event');
      console.log(e.target);
      let selectedElement = e.target;
      let selectedValue = selectedElement.querySelector('input');
      console.log(selectedValue.value);
      console.log(results[selectedValue.dataset.resultid]);
      config.inputSource.value = selectedValue.value;
      config.targetID.value = selectedValue.dataset.id;
      if ('function' === typeof window.resulthandlerBS) {
        resulthandlerBS(config.name, results[selectedValue.dataset.resultid]);
      }
      clearListBS();
    });

    console.log('Add dropdown to Input Source');

    console.log(newDiv);
    sourceBS.parentElement.append(newDiv);

  }

function handleInputBS(e, config) {
  console.log('handleInputBS');
  let input = e.target;
  let inputValue = e.target.value;
  
  if ( inputValue.length < config.minLength ) return;

  console.log(e);
  console.log(config);

  fetch(config.fetchURL + '?term='+ encodeURIComponent(inputValue) )
  .then(response => response.json())
  .then(response  => {
      results = response;
      console.log(results);
      addResultsBS(config, results);
  })
  .catch(error => console.error('Error:', error)); 

}

function handleKeyDownBS(e, config) {

  const autocompleteDiv = document.getElementById("autocompleteBS-list");
  const sourceBS = config.inputSource;
  
  if ( ! autocompleteDiv ) return;

  let currentPosition = parseInt(autocompleteDiv.dataset.current);
  let totalResults = parseInt(autocompleteDiv.dataset.results);

  if ( autocompleteDiv.dataset.forinputbs == e.target.id ) {
    console.log('Key Pressed: ' + e.keyCode);

    let keyPressed = parseInt(e.keyCode);
    let keyAction = '';

    if ( keyPressed === 40 || keyPressed === 9 ) keyAction = 'down'
    if ( keyPressed === 38 || (e.shiftKey && keyPressed == 9) ) keyAction = 'up'
    if ( keyPressed === 13 ) keyAction = 'enter';
    if ( keyPressed === 27 ) keyAction = 'escape';

    if (keyAction) console.log(keyAction);
  
    switch ( keyAction ) {
      case 'down':
        e.preventDefault();
        if ( currentPosition === -1 ) {
          currentPosition = 1;
        } else {
          currentPosition++;
        }
        if ( currentPosition > totalResults ) currentPosition = 1;
        console.log('New Position: ' + currentPosition);
        autocompleteDiv.dataset.current = currentPosition;
        setPositionBS(config, currentPosition);
        break;
      case 'up':
        e.preventDefault();
        if ( currentPosition === -1 ) {
          currentPosition = 1;
        } else {
          currentPosition--;
        }
        if ( currentPosition < 1 ) currentPosition = totalResults;
        console.log('New Position: ' + currentPosition);
        autocompleteDiv.dataset.current = currentPosition;
        setPositionBS(config, currentPosition);
        break;
      case 'enter':
        e.preventDefault();
        clearListBS();
        console.log(currentPosition);
        config.targetID.value = results[currentPosition].id;
        if ('function' === typeof window.resulthandlerBS) {
          resulthandlerBS(config.name, results[currentPosition]);
        }
        break;
      case 'escape':
        e.preventDefault();
        config.inputSource.value = '';
        config.targetID.value = '';
        clearListBS();
        break;
    }
  } else {
    console.log('No Key Action');     
  }

}

function setPositionBS(config, positionBS) {
  const autocompleteDiv = document.getElementById("autocompleteBS-list");
  if ( ! autocompleteDiv ) return;

  const listItems = Array.from(autocompleteDiv.children);

  listItems.forEach( function(listItem) {
    let selectedValue = listItem.querySelector('input');
    // console.log(selectedValue.dataset.resultid);
    if ( parseInt(selectedValue.dataset.resultid) == positionBS - 1 ) {
      listItem.classList.add("autocompleteBS-active");
      config.inputSource.value = selectedValue.value;
    } else {
      listItem.classList.remove("autocompleteBS-active");
    }
  });
  
}

function clickCheckBS(target, config) {

   const autocompleteDivC = document.getElementById("autocompleteBS-list");

   if ( ! autocompleteDivC ) return;

   if ( autocompleteDivC && autocompleteDivC.dataset.forinputbs == target.id ) {
     console.log('do not clear');
   } else {
     console.log('clear list');     
     clearListBS();
   }


}


function autocompleteBS(configBS) {

  document.addEventListener('click',  function(e) { clickCheckBS(e.target,configBS); } );

  configBS.forEach( function(config) {
    
    var updateValueDebounce = debounce(function(e) {
      handleInputBS(e, config);
    }, config.debounceMS);

    console.log(config.inputSource);
    config.inputSource.addEventListener('input', updateValueDebounce);
    config.inputSource.addEventListener('keydown',  function(e) { handleKeyDownBS(e,config); } );
    
  });

}

