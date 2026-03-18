'use client'
import { useState } from 'react';
import { useAuth } from '@/lib/AuthHandler';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import Link from 'next/link';


export default function LoginPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault(); //Evite le rechargement de la page qui bloque le router
        try{
            await login(email, password);
            router.push('/');
        } 
        catch (err) {
            setError('Invalid email or password');
        }
    }

    return (
        <>
            <div className={styles.formContainer}>
                <img src="/icons/Logo_M-VERSE.png" alt="logo" className={styles.logo}/>
                <p>Sign in to get access to your collection and more</p>
                <form onSubmit={submitHandler}>
                    <div className={styles.input}>
                        <input className={styles.query} type='email' placeholder='Enter your Email' value={email} onChange={(e)=> setEmail(e.target.value)} required/>
                    </div>
                    <div className={styles.input}>
                        <input className={styles.query} type='password' placeholder='Enter your password' value={password} onChange={(e)=> setPassword(e.target.value)} required/>
                    </div>
                    <button className={styles.submitButton} type='submit'>Login</button>
                </form>
                {error && <p>{error}</p>}
                <p>
                    Want to create an account ?
                    <Link href="/register">Sign up</Link>
                </p>
            </div>
        </>
    );
}