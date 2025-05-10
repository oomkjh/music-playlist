import React, { useEffect, useState } from "react";
import "./playlist.css";
import api from "../../api";

interface Song {
  id: number;
  title: string;
  artist: string;
}

interface Playlist {
  id: number;
  name: string;
  songs: Song[];
}

function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const songRes = await api.get<Song[]>("/songs");
    const playlistRes = await api.get<Playlist[]>("/playlists");
    setSongs(songRes.data);
    setPlaylists(playlistRes.data);
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    const res = await api.post<Playlist>("/playlists", {
      name: newPlaylistName,
    });
    setPlaylists((prev) => [...prev, res.data]);
    setNewPlaylistName("");
  };

  const addSong = async (playlistId: number, songId: number) => {
    const res = await api.post<Playlist>(`/playlists/${playlistId}/songs`, {
      songId,
    });
    setPlaylists(playlists.map((p) => (p.id === res.data.id ? res.data : p)));
  };

  const removeSong = async (playlistId: number, songId: number) => {
    const res = await api.delete<Playlist>(
      `/playlists/${playlistId}/songs/${songId}`
    );
    setPlaylists(playlists.map((p) => (p.id === res.data.id ? res.data : p)));
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>🎵 My Playlist</h2>
      </aside>

      <main className="main-content">
        <div className="main-header">
          <input
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="New Playlist Name"
          />
          <button className="btn-green" onClick={createPlaylist}>
            Create
          </button>
        </div>

        <h2>🎧 All Songs</h2>
        <div className="song-list">
          {songs.map((song) => (
            <div key={song.id} className="song-item">
              {song.title} – {song.artist}
            </div>
          ))}
        </div>

        <h2>📂 Playlists</h2>
        {playlists.map((playlist) => (
          <div key={playlist.id} className="playlist">
            <h3>{playlist.name}</h3>
            <ul>
              {playlist.songs.map((song) => (
                <li key={song.id}>
                  {song.title}
                  <button
                    className="ml-2 hover:pointer"
                    onClick={() => removeSong(playlist.id, song.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <select
              onChange={(e) => addSong(playlist.id, Number(e.target.value))}
            >
              <option value="">Add Song</option>
              {songs.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.title}
                </option>
              ))}
            </select>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
