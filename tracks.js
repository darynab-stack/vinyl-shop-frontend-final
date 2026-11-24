function formatDuration(seconds) {
    const totalSeconds = Number(seconds) || 0;
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function renderTracks(album, container) {
    container.innerHTML = '';

    const heading = document.createElement('h3');
    heading.className = 'card-section-title';
    heading.textContent = 'Треки';
    container.appendChild(heading);

    const status = document.createElement('p');
    status.className = 'tracks-status';
    status.textContent = 'Завантаження...';
    container.appendChild(status);

    try {
        const response = await fetch(`${API_URL}/albums/${album.id}/tracks/`);
        if (!response.ok) {
            status.textContent = 'Не вдалося завантажити пісні';
            return;
        }

        const tracks = await response.json();
        if (!tracks.length) {
            status.textContent = 'Пісні не знайдено';
            return;
        }

        status.remove();

        const list = document.createElement('ul');
        list.className = 'tracks-list';

        tracks.forEach((track, index) => {
            const item = document.createElement('li');
            item.className = 'track-item';

            const info = document.createElement('div');
            info.className = 'track-info';

            const title = document.createElement('span');
            title.className = 'track-title';
            title.textContent = `${index + 1}. ${track.title}`;

            const duration = document.createElement('span');
            duration.className = 'track-duration';
            duration.textContent = formatDuration(track.duration);

            info.appendChild(title);
            info.appendChild(duration);
            item.appendChild(info);

            if (track.preview) {
                const audio = document.createElement('audio');
                audio.className = 'track-audio';
                audio.controls = true;
                audio.preload = 'none';
                audio.src = track.preview;
                item.appendChild(audio);
            }

            list.appendChild(item);
        });

        container.appendChild(list);
    } catch (error) {
        status.textContent = 'Не вдалося завантажити пісні';
    }
}