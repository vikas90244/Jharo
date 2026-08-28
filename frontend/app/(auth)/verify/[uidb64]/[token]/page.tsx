'use client';

import { useEffect, useState } from 'react';
import { useParams} from 'next/navigation';
import Link from 'next/link';
import styles from '../../../auth.module.scss';

export default function VerifyEmailPage() {
  const params = useParams();
//   const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/auth/verify/${params.uidb64}/${params.token}/`);
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.log(error)
        setStatus('error');
      }
    };

    if (params.uidb64 && params.token) {
      verifyEmail();
    }
  }, [params]);

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        {status === 'loading' && <h2>Verifying your email...</h2>}
        {status === 'success' && (
          <>
            <h2>Email Verified!</h2>
            <p className={styles.subtitle}>Your account is ready.</p>
            <Link href="/login" className={styles.linkButton}>Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h2>Verification Failed</h2>
            <p className={styles.subtitle}>The link may be invalid or expired.</p>
          </>
        )}
      </div>
    </div>
  );
}