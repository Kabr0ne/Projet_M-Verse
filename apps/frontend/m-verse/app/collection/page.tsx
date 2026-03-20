'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthHandler';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import styles from './collection.module.css';

interface CollectionItem {
  MediaInfo: {
    id: number;
    title: string;
    posterUrl: string;
  };
}

export default function CollectionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [myMedia, setMyMedia] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    if (user.loggedIn) {
      fetchCollection();
    }
  }, [user]);

  const fetchCollection = async () => {
    try {
      const res = await api.get('/media/collection/me');
      setMyMedia(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoading) return null;

  return (
    <div className={styles.container}>
      <h1>Ma Collection</h1>

      {user.loggedIn ? (
        <div className={styles.grid}>
          {myMedia.length > 0 ? (
            myMedia.map((item) => (
              <div key={item.MediaInfo.id} className={styles.card}>
                <img src={item.MediaInfo.posterUrl} alt={item.MediaInfo.title} />
                <p>{item.MediaInfo.title}</p>
              </div>
            ))) : ( <p className={styles.emptyMessage}>Ta collection est vide pour le moment.</p>)}
        </div> ) : (
        <>
          <p>You must be logged in to view your collection.</p>
          <button  className={styles.submitButton}  onClick={() => router.push('/login')}>Go to Login</button>
        </>
      )}
    </div>
  );
}