import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { deepMerge } from '@/utils';
import { ILayoutConfig, useLayout } from '@/providers';
import { authLayoutConfig } from './AuthLayoutConfig';

// ✅ Context value type
interface AuthLayoutContextProps {
  layout: ILayoutConfig;
}

// ✅ Initial layout value
const initialLayoutProps: AuthLayoutContextProps = {
  layout: authLayoutConfig
};

// ✅ Create Context
const LayoutContext = createContext<AuthLayoutContextProps>(initialLayoutProps);

// ✅ Custom Hook
export const useAuthLayout = () => useContext(LayoutContext);

export const AuthLayoutProvider = ({ children }: PropsWithChildren) => {
  const { getLayout, setCurrentLayout } = useLayout();

  // ✅ Memoize layout config so deepMerge runs only when needed
  const mergedLayout = useMemo(() => {
    return deepMerge(authLayoutConfig, getLayout(authLayoutConfig.name));
  }, [getLayout]);

  // ✅ Set current layout only when mergedLayout changes
  useEffect(() => {
    setCurrentLayout(mergedLayout);
  }, [mergedLayout, setCurrentLayout]);

  return (
    <LayoutContext.Provider value={{ layout: mergedLayout }}>{children}</LayoutContext.Provider>
  );
};
