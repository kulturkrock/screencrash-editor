import { ReactNode, useState } from 'react';
import { FaChevronCircleDown, FaChevronCircleUp } from 'react-icons/fa';
import '../styles/Collapsible.css';

interface IProps {
  header: string;
  defaultOpen: boolean;
  children: ReactNode;
}

export default (props: IProps) => {
  const { header, children, defaultOpen } = props;
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <div
        className="ToggleHeader Unselectable"
        role="presentation"
        onKeyDown={(event) => {
          if (event.key === 'Enter') setOpen(!open);
        }}
        onClick={() => setOpen(!open)}
      >
        <h3>{header}</h3>
        <div className="ToggleIcon">
          {open ? (
            <span>
              HIDE <FaChevronCircleUp />
            </span>
          ) : (
            <span>
              SHOW <FaChevronCircleDown />
            </span>
          )}
        </div>
      </div>
      <div className={`ToggleBody ${open ? '' : 'Hidden'}`}>{children}</div>
    </div>
  );
};
