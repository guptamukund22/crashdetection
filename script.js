const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const levelElement = document.querySelector('.level .value');
const progressBar = document.querySelector('.progress');

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const maxLevel = 255;

    const update = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        levelElement.textContent = average.toFixed(2);
        progressBar.style.width = `${(average / maxLevel) * 100}%`;
      
        if (average > 40) {
          levelElement.classList.add('warning');
          levelElement.textContent = 'ACCIDENT';
          showAccidentPopup();
        } else {
          levelElement.classList.remove('warning');
        }
      
        requestAnimationFrame(update);
      };
      
      function showAccidentPopup() {
        const accidentPopup = document.createElement('div');
        accidentPopup.textContent = 'Accident occurred!';
        accidentPopup.className = 'accident-popup';
        document.body.appendChild(accidentPopup);
      
        setTimeout(() => {
          accidentPopup.remove();
        }, 5000); // Remove the popup after 5 seconds
      }
      
      

    update();
  })
  .catch(err => {
    console.error('Error accessing microphone:', err);
  });
