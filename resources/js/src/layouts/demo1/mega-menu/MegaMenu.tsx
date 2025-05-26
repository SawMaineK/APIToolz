/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useCallback } from 'react';
import { useResponsive } from '@/hooks';
import { usePathname } from '@/providers';
import { useDemo1Layout } from '@/layouts/demo1';
import { MegaMenuInner } from '.';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';

const MegaMenu = () => {
  const desktopMode = useResponsive('up', 'lg');
  const { pathname, prevPathname } = usePathname();
  const { mobileMegaMenuOpen, setMobileMegaMenuOpen } = useDemo1Layout();

  const handleDrawerClose = useCallback(() => {
    setMobileMegaMenuOpen(false);
  }, [setMobileMegaMenuOpen]);

  useEffect(() => {
    if (!desktopMode && prevPathname !== pathname) {
      handleDrawerClose();
    }
  }, [desktopMode, pathname, prevPathname, handleDrawerClose]);

  if (desktopMode) {
    return <MegaMenuInner />;
  }

  return (
    <Sheet open={mobileMegaMenuOpen} onOpenChange={handleDrawerClose}>
      <SheetContent
        className="border-0 p-0 w-[225px] scrollable-y-auto"
        forceMount
        side="left"
        close={false}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Mobile Menu</SheetTitle>
        </SheetHeader>
        <MegaMenuInner />
      </SheetContent>
    </Sheet>
  );
};

export { MegaMenu };
