import type { CSSProperties } from 'react';

interface Props {
  text: string;
  hiddenIndexes: number[];
}

const STYLES = {
  container: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 1.6,
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: 4,
    padding: '8px 10px',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  } as CSSProperties,
  hidden: {
    color: '#888',
    fontWeight: 'bold',
  } as CSSProperties,
  visible: {
    color: '#222',
  } as CSSProperties,
};

// Renders the quote text with hidden character positions replaced by •.
export default function CryptogramPreview({ text, hiddenIndexes }: Props) {
  const hiddenSet = new Set(hiddenIndexes);
  const chars = text.split('').map((ch, i) => (
    <span key={i} style={hiddenSet.has(i) ? STYLES.hidden : STYLES.visible}>
      {hiddenSet.has(i) ? '•' : ch}
    </span>
  ));

  return <div style={STYLES.container}>{chars}</div>;
}
