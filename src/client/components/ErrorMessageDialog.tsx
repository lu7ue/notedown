type Props = {
  title: string;
  message: string;
  onClose: () => void;
};

export function ErrorMessageDialog({ title, message, onClose }: Props) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{title}</h2>
        </div>
        <p className="dialog-text">{message}</p>
        <div className="dialog-actions">
          <button className="dialog-button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
