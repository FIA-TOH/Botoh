interface Props {
  visible: boolean;
  position: number | null;
  content: string;
}

export function HoverTooltip({
  visible,
  position,
  content,
}: Props) {
  if (!visible || position === null) {
    return null;
  }

  return (
    <div
      className="pit-wall-player-tooltip"
      style={{
        position: 'absolute',
        left: '100%',
        top: `${position}px`,
        height: '32px',
        width: 'max-content',
        backgroundColor: '#1E1E1E',
        border: '2px solid #FF0000',
        borderLeft: 'none',
        zIndex: 9999,
        transform: 'translateY(-2px)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '12px',
        paddingRight: '12px',
        color: '#FFFFFF',
        fontWeight: 'bold',
      }}
    >
      {content}
    </div>
  );
}
