import { Icon } from "./Icon";

type Props = {
  top: number;
  left: number;
  onDelete: () => void;
  onClose: () => void;
};

export function ItemMenu({ top, left, onDelete, onClose }: Props) {
  return (
    <>
      <div className="menu-backdrop" onClick={onClose} />
      <div className="item-menu" style={{ top, left }}>
        <button className="menu-item danger" onClick={onDelete}>
          <Icon name="trash" />
          Delete
        </button>
      </div>
    </>
  );
}
