'use client';

import styles from './page.module.css';
import { useState, useEffect, use } from 'react';
import api from '@/lib/api';

interface SearchResult {
  id: number;
  title: string;
  posterUrl: string;
}


const mediaTypes = [
  { id: 'movie', label: 'Movie', api: '/media/search/tmdb/movie' },
  { id: 'tvshow', label: 'TV Show', api: '/media/search/tmdb/show' },
  { id: 'music', label: 'Music', api: '/api/music' },
  { id: 'game', label: 'Game', api: '/api/games' },
];

export default function MainPage() {
  const [activeType, setActiveType] = useState('movie');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const performSearch = async () => {
    if(!query) {return}

    setLoading(true);
    setError(null);

    try{
      const type = mediaTypes.find((t) => t.id === activeType) || mediaTypes[0];
      console.log(`Searching for "${query}" in ${type.label}...`);
      const response = await api.get(
        type.api, { params: { title: query } }
      );
      setResults(response.data || []);
    }
    catch (e) {
      setError(e as Error);
    }
    finally {
      setLoading(false);
    }

  }

  return (
    <>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <img src="/icons/Logo_M-VERSE.png" alt="M-Verse Logo" style={{ width: '300px', marginBottom: '20px' }} />
        <p>Welcome on M-Verse, A platform for media tracking and discovery</p>
        <nav className={styles.typeSelector}>
          {mediaTypes.map((type) => (
            <button key={type.id} className={`${styles.typeButton} ${activeType === type.id ? styles.active : ''}`} 
            onClick={() => { setActiveType(type.id); setResults([]);}}>
              {type.label}
            </button>
          ))}
        </nav>

        <div className={styles.searchBox}>
          <input className={styles.inputSearch} placeholder={`Looking for a ${activeType} ? `} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && performSearch()}/>
          <button className={styles.searchButton} onClick={performSearch}>
            <img className={styles.imgButton} src="/icons/search_icon.png" alt="search_icon"/>
          </button>
        </div>
        
        <div className={styles.resultsGrid}>
          {results.length > 0 ? (
            results.map((item, index) => (
                <div key={item.id || index} className={styles.card}>
                  <img src={item.posterUrl} alt={item.title} className={styles.poster} />
                  <strong><p className={styles.titleMovie}>{item.title}</p></strong>
                </div>
              ))) : (
                !loading && <p className={styles.noResult}>No results found.</p>
            )}
        </div>
      </div>
    </>
  );
}