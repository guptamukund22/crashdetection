const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const levelElement = document.querySelector('.level .value');
const progressBar = document.querySelector('.progress');
const stopButton = document.querySelector('.stop-button'); // New button element

let isStopped = false; // Flag to indicate if the noise should stop

stopButton.addEventListener('click', () => {
  isStopped = true;
  audioContext.suspend(); // Pause the audio context
});

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 2048;
    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    const maxLevel = 1; // Maximum amplitude value (for normalization)
    const noiseThreshold = 0.1; // Adjust this value for accurate noise detection

    const update = () => {
      if (isStopped) return; // Exit the update loop if noise should stop

      analyser.getFloatTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += Math.abs(dataArray[i]);
      }
      const average = sum / bufferLength;

      levelElement.textContent = average.toFixed(2);
      progressBar.style.width = `${(average / maxLevel) * 100}%`;

      if (average > noiseThreshold) {
        levelElement.classList.add('warning');
        levelElement.textContent = 'ACCIDENT';
        showAccidentPopup();
        playBeep(); // Play a loud sound when the value goes above the threshold
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
      }, 8000); // Remove the popup after 8 seconds
    }

    function playBeep() {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.value = 1;
      oscillator.frequency.value = 2000; // Set the frequency of the beep sound
      oscillator.type = 'sine';

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 10000); // Set the duration of the beep sound
    }

    update();
  })
  .catch(err => {
    console.error('Error accessing microphone:', err);
  });
