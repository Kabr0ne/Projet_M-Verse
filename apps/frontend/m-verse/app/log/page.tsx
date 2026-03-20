'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthHandler';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import styles from './log.module.css';

interface LogEntry {
  id: string;
  watchedAt: string;
  rating: number;
  liked: boolean;
  mediaInfo: {
    title: string;
    posterUrl: string;
  }
}

export default function LogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (user.loggedIn) {
      fetchLogs();
    }
    setIsLoading(false);

  }, [user]);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/media/logs/my-logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const groupedLogs = logs.reduce((acc: any, log) => {
    const date = new Date(log.watchedAt);
    const monthYear = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(log);
    return acc;

  }, {});

  if (isLoading) return null;

  return (
    <div className={styles.logContainer}>
      {user.loggedIn ? (
        <>
          <h1 className={styles.pageTitle}>
            Entries of <span className={styles.username}>{user.username}</span>
          </h1>
          
          {Object.keys(groupedLogs).map((month) => (
            <div key={month} className={styles.monthGroup}>
              <div className={styles.monthLabel}>
                <span>{month}</span>
              </div>

              <div className={styles.entriesList}>
                {groupedLogs[month].map((entry: LogEntry) => (
                  <div key={entry.id} className={styles.logRow}>
                    <div className={styles.date}>
                        {new Date(entry.watchedAt).getDate()}
                    </div>
                    
                    <img src={entry.mediaInfo.posterUrl} className={styles.smallPoster} alt="poster"/>
                    
                    <div className={styles.title}>
                      <span className={styles.mediaTitle}>{entry.mediaInfo.title}</span>
                    </div>

                    <div>
                      <p className={styles.rating}>{entry.rating}/10</p>
                    </div>

                    <div className={styles.like}>
                      {entry.liked ? '❤️' : '🤍'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </> ) : (
        <div>
          <h1>Entries List</h1>
          <p className={styles.notLoggedInText}>Log in to see your entries.</p>
          <button className={styles.loginBtn} onClick={() => router.push('/login')}>
            Login
          </button>
        </div>
      )}
    </div>
  );
}