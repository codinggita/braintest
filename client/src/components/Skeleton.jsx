import { motion } from 'framer-motion';

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '12px' }) => (
  <motion.div
    className="skeleton"
    style={{ width, height, borderRadius }}
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
  />
);

export const SkeletonCard = () => (
  <div className="glass" style={{ padding: '24px' }}>
    <Skeleton height="32px" width="60%" />
    <Skeleton height="16px" width="40%" style={{ marginTop: '12px' }} />
    <Skeleton height="16px" width="80%" style={{ marginTop: '12px' }} />
    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
      <Skeleton width="100px" height="40px" />
      <Skeleton width="100px" height="40px" />
    </div>
  </div>
);

export const SkeletonQuizCard = () => (
  <div className="glass" style={{ padding: '24px' }}>
    <Skeleton height="28px" width="70%" />
    <Skeleton height="14px" width="30%" style={{ marginTop: '12px' }} />
    <Skeleton height="14px" width="50%" style={{ marginTop: '12px' }} />
    <Skeleton width="120px" height="40px" style={{ marginTop: '20px' }} />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="glass" style={{ padding: '24px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
      <Skeleton height="16px" width="100%" />
      <Skeleton height="16px" width="100%" />
      <Skeleton height="16px" width="100%" />
      <Skeleton height="16px" width="100%" />
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
        <Skeleton height="20px" width="100%" />
        <Skeleton height="20px" width="100%" />
        <Skeleton height="20px" width="100%" />
        <Skeleton height="20px" width="100%" />
      </div>
    ))}
  </div>
);

export const LoadingScreen = () => (
  <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <motion.div
      style={{ textAlign: 'center' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        style={{
          width: '60px',
          height: '60px',
          border: '4px solid var(--glass-border)',
          borderTop: '4px solid var(--electric-blue)',
          borderRadius: '50%',
          margin: '0 auto 20px'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
    </motion.div>
  </div>
);

export default Skeleton;