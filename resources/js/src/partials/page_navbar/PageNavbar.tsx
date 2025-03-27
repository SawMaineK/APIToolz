import { Container } from '@/components/container';
import { useLayout, useMenus } from '@/providers';
import { NavbarMenu } from '@/partials/menu/NavbarMenu';
import { Navbar } from '@/partials/navbar';

interface PageNavbarProps {
  menuConfig: any; // Replace 'any' with the appropriate type if known
}

const PageNavbar = ({ menuConfig }: PageNavbarProps) => {
  const { currentLayout } = useLayout();

  if (menuConfig && currentLayout?.name === 'demo1-layout') {
    return (
      <Navbar>
        <Container>
          <NavbarMenu items={menuConfig} />
        </Container>
      </Navbar>
    );
  } else {
    return <></>;
  }
};

export { PageNavbar };
