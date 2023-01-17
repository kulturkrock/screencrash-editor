import { ReactNode, useState } from 'react';
import { FaChevronCircleDown, FaChevronCircleUp } from 'react-icons/fa';
import '../styles/Collapsible.css';

interface IProps {
  header: string;
  children: ReactNode;
}

export default (props: IProps) => {
  const [open, setOpen] = useState(false);
  const { header, children } = props;
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
          {open ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
        </div>
      </div>
      <div className={`ToggleBody ${open ? '' : 'Hidden'}`}>{children}</div>
    </div>
  );
};
