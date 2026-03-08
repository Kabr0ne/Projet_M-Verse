'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useState } from 'react';

const MENU_ITEMS = [
  { label: 'Home', href: '/', icon: '/icons/home_icon.png' },
  { label: 'My Collection', href: '/collection', icon: '/icons/collection_icon.png' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
    {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
      <button className={`${styles.toggleBtn} ${isOpen ? styles.toggleBtnActive : ''}`} onClick={() => setIsOpen(!isOpen)}>≡</button>

      <nav className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <Image src="/icons/Logo_M-VERSE.png" alt="M-Verse Logo" width={2000} height={500} className={styles.logoImg}/>
        </div>
        

        <ul className={styles.menu}>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href} className={`${styles.link} ${isActive ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                  <div className={styles.iconWrapper}>
                    <Image   src={item.icon}   alt=""   width={24}   height={24} className={styles.iconImg}/>
                  </div>

                  <span className={styles.linkLabel}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
    </>
    

  );
}