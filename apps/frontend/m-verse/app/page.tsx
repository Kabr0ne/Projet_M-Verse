'use client';

import styles from './page.module.css';
import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthHandler';

interface SearchResult {
  id: number;
  externalId: number;
  title: string;
  posterUrl: string;
}


const mediaTypes = [
  { id: 'movie', label: 'Movie', api: '/media/search/tmdb/movie' },
  { id: 'tvshow', label: 'TV Show', api: '/media/search/tmdb/show' },
  { id: 'music', label: 'Music', api: '/api/music' },
  { id: 'game', label: 'Game', api: '/api/games' },
];

const mediaThumbnails = [
  { id: 1, href: '/img/aftersun.jpg' },
  { id: 2, href: '/img/ALL OF ME.jpg' },
  { id: 3, href: '/img/APRIL WAVE.jpg' },
  { id: 4, href: '/img/bcs.jpg' },
  { id: 5, href: '/img/billy-elliott.jpg' },
  { id: 6, href: '/img/GOSSE COUREUR.jpg' },
  { id: 7, href: '/img/hk.jpg' },
  { id: 8, href: '/img/In Rainbows.jpg' },
  { id: 9, href: '/img/lalaland.jpg' },
  { id: 10, href: '/img/libre-et-assoupi.jpg' },
  { id: 11, href: '/img/lies of p.jpg' },
  { id: 12, href: '/img/samuel.jpg' },
  { id: 13, href: '/img/skong.jpg' },
  { id: 14, href: '/img/spiderman3.jpg' },
  { id: 15, href: '/img/the-girl-who-leapt-through-time.jpg' },
  { id: 16, href: '/img/whiplash.jpg' },
  { id: 17, href: '/img/JVLIVS.jpg' },
];

export default function MainPage() {
  const [activeType, setActiveType] = useState('movie');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

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



  interface MovieDetails {
    plot: string;
    genres: string;
    runtime: number;
    title: string;
    posterUrl: string;
    release_date: string;
    vote_average: number;
  }

  const [selectedMedia, setSelectedMedia] = useState<SearchResult | null>(null);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchMovieDetails = async (externalId: number) => {
  setDetailsLoading(true);
    try {
      const res = await api.get(`/media/search/tmdb/movie/${externalId}`);
      setDetails(res.data);
    } catch (err) {
      console.error("Error while trying to get movie details", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [provider, setProvider] = useState('');

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    switch (activeType) {
      case 'movie': setProvider('TMDB'); break;
      case 'tvshow': setProvider('TMDB'); break;
    }

    if (!user.loggedIn) return alert("Please log in first!");

    const payload = {
        externalId: String(selectedMedia?.externalId),
        provider: 'TMDB',
        type: activeType.toUpperCase(),
        seasonId: null, //To implement later
        status: 'WATCHED',
        rewatched: false,
        rating: rating,
        liked: liked,
        comment: comment,
      }
    
    console.log(payload);

    try {
      await api.post('/media/logs', payload); 
      
      alert("Added to your log!");
      setSelectedMedia(null);
      setComment(''); setRating(5); setLiked(false);
    } catch (err) {
      alert("Error adding entry.");
    }
  };

  return (
    <>
      <div className={styles.mediaSideBar1}>
        <div className={styles.scrollWrapper}>
          {[...mediaThumbnails, ...mediaThumbnails].map((img, i) => (
            <img key={i} src={img.href} className={styles.sideImg} alt="deco" />
          ))}
        </div>
      </div>

      <div className={styles.mediaSideBar2}>
        <div className={`${styles.scrollWrapper} ${styles.reverse}`}>
          {[...mediaThumbnails, ...mediaThumbnails].map((img, i) => (
            <img key={i} src={img.href} className={styles.sideImg} alt="deco" />
          ))}
        </div>
      </div>
      
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <img src="/icons/Logo_M-VERSE.png" alt="M-Verse Logo" style={{ width: '300px', marginBottom: '20px' }} />
        {user.loggedIn ? <div className={styles.usernameContainer}><p>Welcome home</p><p className={styles.username}>{user.username}</p><p>!</p></div> : <p>Welcome on M-Verse, A platform for media tracking and discovery</p>}
        <nav className={styles.typeSelector}>
          {mediaTypes.map((type) => (
            <button key={type.id} className={`${styles.typeButton} ${activeType === type.id ? styles.active : ''}`} 
            onClick={() => { setActiveType(type.id); setResults([]); }}>
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
          {results.map((item, index) => (
                <div key={item.id || index} className={styles.card} onClick={() => {setSelectedMedia(item); fetchMovieDetails(item.externalId);}}>
                  <img src={item.posterUrl} alt={item.title} className={styles.poster} />
                  <strong><p className={styles.titleMovie}>{item.title}</p></strong>
                </div>
              ))}
        </div>
      </div>
      {selectedMedia && (
        <div className={styles.DetailOverlay} onClick={() => { setSelectedMedia(null); setDetails(null); }}>
          <div className={styles.DetailContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.DetailLayout}>
              <img src={selectedMedia.posterUrl} className={styles.DetailPoster} />
              
              <div className={styles.DetailInfo}>
                <h2>{selectedMedia.title}</h2>
                
                {detailsLoading ? (
                  <p>Loading Details</p>
                ) : details ? (
                  <div className={styles.detailsBox}>
                    <p className={styles.plot}>{details.plot}</p>
                    <div className={styles.meta}>
                      <span>📅 {new Date(details.release_date).getFullYear()}</span>
                      <span>⏱️ {details.runtime} min</span>
                      <span>⭐ {details.vote_average.toFixed(1)}/10</span>
                    </div>
                  </div>
                ) : null}

                <form onSubmit={handleLogSubmit} className={styles.logForm}>
                  <div className={styles.formColumnLeft}>
                    <div className={styles.inputGroup}>
                      <label>Rating</label>
                      <input  type="number"  min="0" max="10" step="0.5"  value={rating}  onChange={(e) => setRating(Number(e.target.value))} className={styles.ratingInput}/>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Favorite</label>
                      <button  type="button"  onClick={() => setLiked(!liked)}  className={liked ? styles.heartActive : styles.heart}>
                        {liked ? '❤️' : '🤍'}
                      </button>
                    </div>

                    <button type="submit" className={styles.sendBtn}>SEND</button>
                  </div>

                  <div className={styles.formColumnRight}>
                    <label>Review</label>
                    <textarea  value={comment}  onChange={(e) => setComment(e.target.value)}  placeholder="What did you think about it?" className={styles.reviewTextarea}/>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}