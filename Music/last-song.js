const clientId = '0b5fbd7968674f6d9535b5d12e124e23';
const clientSecret = '3e58f955fa5b4f20a4a83102bb113f5c';

async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

async function getCurrentlyPlayingSong(accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  });

  const data = await response.json();
  return data;
}

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

async function displayCurrentlyPlayingSong() {
  const accessToken = await getAccessToken();
  if (!accessToken) return;

  const currentlyPlaying = await getCurrentlyPlayingSong(accessToken);
  if (!currentlyPlaying || !currentlyPlaying.is_playing) {
    document.getElementById('last-played-song-info').innerHTML = '<p>No song is currently playing.</p>';
    return;
  }

  const song = currentlyPlaying.item;
  const progress = currentlyPlaying.progress_ms;
  const duration = song.duration_ms;

  const songInfoDiv = document.getElementById('last-played-song-info');
  songInfoDiv.innerHTML = `
    <div class="song-info-container">
      <img src="${song.album.images[0].url}" alt="${song.album.name}" class="album-cover">
      <div class="song-details">
        <p><strong>Song:</strong> ${song.name}</p>
        <p><strong>Artist:</strong> ${song.artists[0].name}</p>
        <p><strong>Album:</strong> ${song.album.name}</p>
        <div class="timeline">
          <span>${formatTime(progress)}</span>
          <div class="progress-bar">
            <div class="progress" style="width: ${(progress / duration) * 100}%"></div>
          </div>
          <span>${formatTime(duration)}</span>
        </div>
      </div>
    </div>
  `;
}

// Initial call to display the currently playing song
displayCurrentlyPlayingSong();

// Refresh the currently playing song every 30 seconds
setInterval(displayCurrentlyPlayingSong, 30000);