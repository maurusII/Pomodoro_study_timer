const studyForm = document.getElementById('studyForm');
const studyCyclesEl= document.getElementById('studyCycles');
// Al caricamento della pagina rimuove restTime se il numero di cicli non è ancora impostato o se è 1
if (studyCyclesEl.value <= 1){
  document.getElementById('restTime').parentElement.remove();
}
// Aggiunge e rimuove dinamicamente l'input per il tempo di riposo
studyCyclesEl.addEventListener('change', function(event){
  event.preventDefault();

  let restEl = document.getElementById('restTime');
  if(!restEl && studyCyclesEl.value > 1){
    studyCyclesEl.parentNode.insertAdjacentHTML('afterend',`
      <div>
        <label for="restTime">Enter restTime:</label>
        <input type="number" id="restTime" name="restTime" min="1" required>
      </div>
    `);
  } else if(restEl && studyCyclesEl.value <= 1){
    restEl.parentElement.remove();
  }
})
let working = false;
let firstStart = 0;
// Aggiunge un listener per l'evento di submit al form con id 'studyForm'
studyForm.addEventListener('submit', function(event) {
  // Previene il comportamento di default dell'evento, che sarebbe il submit del form
  event.preventDefault();
  let delta = 0;
  if (firstStart) delta = (Date.now() - firstStart)/1000;
  else firstStart = Date.now();
  if (working) return;
  working = true;

  // Ottiene il tempo di studio inserito dall'utente e lo converte in un numero intero
  const studyTime = parseInt(document.getElementById('studyTime').value, 10);
  // Converte i minuti in secondi per l'animazione
  const animationDuration = studyTime * 60; 

  let cycles = parseInt(studyCyclesEl.value, 10);
  let restTime = 1;
  if (cycles > 1){
    restTime = parseInt(document.getElementById('restTime').value, 10);
  }
  
  // Imposta l'animazione con durata dinamica per gli pseudo-elementi ::before e ::after
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    .blob::before, .blob::after {
      animation: rotate ${animationDuration}s linear forwards;
      animation-delay: ${delta}s;
    }
  `;
  // Aggiunge il foglio di stile creato all'elemento head del documento
  document.head.appendChild(styleSheet)
  // Calcola il tempo di fine aggiungendo la durata del timer al tempo corrente
  const start = Date.now();
  const cycleTime = studyTime*60000 + restTime*60000;
  let passedCycles = 0;
  let resting;
  let studying;
  // Imposta un intervallo che si ripete ogni secondo
  
  let studyTimer = function() {
    const now = Date.now();
    // Calcola la differenza tra il tempo di fine di questo periodo di studio e il tempo corrente
    const difference = studyTime*60000 + start + passedCycles * cycleTime - now;
    let wtf = false;
    // Se la differenza è minore o uguale a 0, ferma l'intervallo
    if (difference <= 0) {
      clearInterval(studying);
      
      // Pulisce il testo dell'elemento con id 'timerDisplay'
      passedCycles += 1;

      styleSheet.innerText = `
        .blob::before, .blob::after {
          animation: rotate ${passedCycles < cycles ? (restTime * 60) : 1}s linear reverse forwards;
          animation-delay: ${((passedCycles-1)*cycleTime/1000) + studyTime*60 + delta}s;
        }
      `;
      
      if (passedCycles < cycles) {
        document.getElementById('timerDisplay').textContent = `${String(restTime).padStart(2, '0')}:00`;
        resting = setInterval(restTimer, 1000);
      }
      else {
        working = false;
        document.getElementById('timerDisplay').textContent = "You are done!";
      }
      return;
    }

    // Calcola i minuti e i secondi rimanenti
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    // Visualizza il tempo rimanente nell'elemento con id 'timerDisplay'
    //padstart aggiunge uno zero prima della stringa se non raggiunge almeno una lunghezza di 2
    document.getElementById('timerDisplay').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  let restTimer = function(){
    const now = Date.now();
    // Calcola la differenza tra il tempo di fine di questo periodo di pausa e il tempo corrente
    const difference = start + passedCycles * cycleTime - now;
    // Se la differenza è minore o uguale a 0, ferma l'intervallo
    if (difference <= 0) {
      clearInterval(resting);
      // Pulisce il testo dell'elemento con id 'timerDisplay'
      
      styleSheet.innerText = `
        .blob::before, .blob::after {
          animation: rotate ${animationDuration}s linear forwards;
          animation-delay: ${passedCycles*cycleTime/1000 + delta}s;
        }
      `;
      document.getElementById('timerDisplay').textContent = `${String(studyTime).padStart(2, '0')}:00`;
      studying = setInterval(studyTimer, 1000);
      return;
    }

    // Calcola i minuti e i secondi rimanenti
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    // Visualizza il tempo rimanente nell'elemento con id 'timerDisplay'
    //padstart aggiunge uno zero prima della stringa se non raggiunge almeno una lunghezza di 2
    document.getElementById('timerDisplay').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  studying = setInterval(studyTimer, 1000);
});
  
      