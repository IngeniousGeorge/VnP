import { useState } from 'react';

export default function DeployPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleDeploy = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/deploy', { method: 'POST' });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div style={{ padding: '3rem', maxWidth: '480px' }}>
      <h1 style={{ marginBottom: '1rem' }}>Déployer le site</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Cliquez sur le bouton ci-dessous pour mettre en ligne toutes les modifications
        publiées depuis le dernier déploiement.
      </p>
      <button
        onClick={handleDeploy}
        disabled={status === 'loading'}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: status === 'loading' ? '#ccc' : '#4945ff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'loading' ? 'Déploiement en cours…' : 'Déployer le site'}
      </button>
      {status === 'success' && (
        <p style={{ marginTop: '1.5rem', color: '#328048' }}>
          Déploiement lancé. Le site sera mis à jour dans quelques minutes.
        </p>
      )}
      {status === 'error' && (
        <p style={{ marginTop: '1.5rem', color: '#d02b20' }}>
          Erreur lors du déploiement. Veuillez réessayer.
        </p>
      )}
    </div>
  );
}
