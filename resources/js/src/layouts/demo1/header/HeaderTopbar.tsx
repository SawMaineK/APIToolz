import { useRef, useState } from 'react';
import { KeenIcon } from '@/components/keenicons';
import { toAbsoluteUrl } from '@/utils';
import { Menu, MenuItem, MenuToggle } from '@/components';
import { DropdownUser } from '@/partials/dropdowns/user';
import { ModalSearch } from '@/partials/modals/search/ModalSearch';
import { useLanguage } from '@/i18n';
import { useAuthContext } from '@/auth/useAuthContext';
import { Cpu } from 'lucide-react';
import { useNavigate } from 'react-router';

const HeaderTopbar = () => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const itemUserRef = useRef<any>(null);

  return (
    <div className="flex items-center gap-2 lg:gap-3.5">

      <Menu>
        <MenuItem
          ref={itemUserRef}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: isRTL() ? 'bottom-start' : 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: isRTL() ? [-20, 10] : [20, 10] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuToggle className="btn btn-icon rounded-full">
            <img
              className="size-9 rounded-full border-2 border-success shrink-0"
              src={
                currentUser?.avatar
                  ? `${import.meta.env.VITE_APP_IMAGE_URL}/${currentUser?.avatar}`
                  : toAbsoluteUrl('/media/avatars/blank.png')
              }
              alt=""
            />
          </MenuToggle>
          {DropdownUser({ menuItemRef: itemUserRef })}
        </MenuItem>
      </Menu>
    </div>
  );
};

export { HeaderTopbar };
