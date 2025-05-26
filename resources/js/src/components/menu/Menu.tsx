import clsx from 'clsx';
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  memo,
  useContext,
  useState
} from 'react';
import { IMenuContextProps, IMenuItemProps, IMenuProps } from './';
import { MenuItem } from './';

// Initial default props for the Menu Context
const initalProps: IMenuContextProps = {
  disabled: false,
  highlight: false,
  multipleExpand: false,
  dropdownTimeout: 0,
  setOpenAccordion: (parentId: string, id: string) => {
    console.log(`Accordion at level ${parentId}, with ID ${id} is now open`);
  },
  isOpenAccordion: (parentId: string, id: string) => {
    console.log(`Checking if accordion at level ${parentId}, with ID ${id} is open`);
    return false;
  }
};

// Create the Menu Context
const MenuContext = createContext(initalProps);

// Custom hook to use Menu Context
const useMenu = () => useContext(MenuContext);

const MenuComponent = ({
  className,
  children,
  disabled = false,
  highlight = false,
  dropdownTimeout = 150,
  multipleExpand = false
}: IMenuProps) => {
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: string | null }>({});

  // Toggle accordion open/close
  const setOpenAccordion = (parentId: string, id: string) => {
    setOpenAccordions((prevState) => ({
      ...prevState,
      [parentId]: prevState[parentId] === id ? null : id
    }));
  };

  // Check if accordion is open
  const isOpenAccordion = (parentId: string, id: string) => {
    return openAccordions[parentId] === id;
  };

  // Map and modify children with unique keys and props
  const modifiedChildren = Children.map(children, (child, index) => {
    if (isValidElement(child)) {
      const key = child.key ?? `menu-item-${index}`;

      if (child.type === MenuItem) {
        const modifiedProps: IMenuItemProps = {
          parentId: 'root',
          id: `root-${index}`
        };

        return cloneElement(child, { ...modifiedProps, key });
      } else {
        return cloneElement(child, { key });
      }
    }

    return child;
  });

  return (
    <MenuContext.Provider
      value={{
        disabled,
        highlight,
        dropdownTimeout,
        multipleExpand,
        setOpenAccordion,
        isOpenAccordion
      }}
    >
      <div className={clsx('menu', className)}>{modifiedChildren}</div>
    </MenuContext.Provider>
  );
};

const Menu = memo(MenuComponent);

export { Menu, useMenu };
