import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { toast } from 'sonner';

import { Container } from '@/components/container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TBranding } from '@/components/menu';
import { TSettingsThemeMode } from '@/config/settings.config';
import { resolveBrandingAssets } from '@/hooks';
import { useSettings } from '@/providers';

const DEFAULT_BRANDING_COLOR = '#00A193';
const DEFAULT_BRANDING_LAYOUT = 'demo1';
const LAYOUT_OPTIONS = [
  { value: 'demo1', label: 'Demo 1' },
  { value: 'demo2', label: 'Demo 2' },
  { value: 'demo3', label: 'Demo 3' },
  { value: 'demo4', label: 'Demo 4' },
  { value: 'demo5', label: 'Demo 5' },
  { value: 'demo6', label: 'Demo 6' },
  { value: 'demo7', label: 'Demo 7' },
  { value: 'demo8', label: 'Demo 8' },
  { value: 'demo9', label: 'Demo 9' },
  { value: 'demo10', label: 'Demo 10' }
];

type BrandingLogoKey = 'logo_url' | 'logo_small_url' | 'logo_dark_url' | 'logo_dark_small_url';

const LOGO_KEYS: BrandingLogoKey[] = [
  'logo_url',
  'logo_small_url',
  'logo_dark_url',
  'logo_dark_small_url'
];

const LOGO_FIELD_CONFIG: Record<BrandingLogoKey, { label: string; description: string }> = {
  logo_url: {
    label: 'Primary logo',
    description: 'Displayed on light backgrounds like default headers and loaders.'
  },
  logo_small_url: {
    label: 'Compact logo',
    description: 'Used for tight spaces such as collapsed sidebars.'
  },
  logo_dark_url: {
    label: 'Dark mode logo',
    description: 'Shown on dark backgrounds when available.'
  },
  logo_dark_small_url: {
    label: 'Dark mode compact logo',
    description: 'Shown in compact areas on dark backgrounds.'
  }
};

const mapBranding = (source?: TBranding | null): TBranding => ({
  app_name: source?.app_name ?? '',
  logo_url: source?.logo_url ?? '',
  logo_small_url: source?.logo_small_url ?? '',
  logo_dark_url: source?.logo_dark_url ?? '',
  logo_dark_small_url: source?.logo_dark_small_url ?? '',
  theme_color: source?.theme_color ?? DEFAULT_BRANDING_COLOR,
  layout: source?.layout ?? DEFAULT_BRANDING_LAYOUT
});

const createEmptyLogoFiles = () =>
  LOGO_KEYS.reduce(
    (acc, key) => {
      acc[key] = null;
      return acc;
    },
    {} as Record<BrandingLogoKey, File | null>
  );

const getLogoPreviewState = (branding: TBranding) =>
  LOGO_KEYS.reduce(
    (acc, key) => {
      acc[key] = (branding[key] as string | undefined) ?? '';
      return acc;
    },
    {} as Record<BrandingLogoKey, string>
  );

const BrandingPage = () => {
  const { settings, updateSettings, storeSettings, getThemeMode } = useSettings();

  const settingsBranding = useMemo(() => mapBranding(settings.branding), [settings.branding]);
  const [branding, setBranding] = useState<TBranding>(settingsBranding);
  const [logoFiles, setLogoFiles] =
    useState<Record<BrandingLogoKey, File | null>>(createEmptyLogoFiles());
  const [logoPreviews, setLogoPreviews] = useState<Record<BrandingLogoKey, string>>(
    getLogoPreviewState(settingsBranding)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [themeMode, setThemeMode] = useState<TSettingsThemeMode>(settings.themeMode);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>(
    getThemeMode() === 'dark' ? 'dark' : 'light'
  );
  const objectUrlRef = useRef<Record<BrandingLogoKey, string | null>>({
    logo_url: null,
    logo_small_url: null,
    logo_dark_url: null,
    logo_dark_small_url: null
  });

  const resetLogoState = useCallback((source: TBranding) => {
    LOGO_KEYS.forEach((key) => {
      const currentUrl = objectUrlRef.current[key];
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
        objectUrlRef.current[key] = null;
      }
    });

    setLogoFiles(createEmptyLogoFiles());
    setLogoPreviews(getLogoPreviewState(source));
  }, []);

  useEffect(() => {
    setBranding(settingsBranding);
    resetLogoState(settingsBranding);
  }, [settingsBranding, resetLogoState]);

  useEffect(() => {
    setThemeMode(settings.themeMode);
    const resolved = getThemeMode();
    setPreviewTheme(resolved === 'dark' ? 'dark' : 'light');
  }, [settings.themeMode, getThemeMode]);

  useEffect(() => {
    return () => {
      LOGO_KEYS.forEach((key) => {
        const currentUrl = objectUrlRef.current[key];
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
      });
    };
  }, []);

  const handleInputChange = (key: keyof TBranding) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setBranding((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleThemeColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setBranding((prev) => ({
      ...prev,
      theme_color: value
    }));
  };

  const handleThemeSelect = (mode: TSettingsThemeMode) => {
    setThemeMode(mode);
    storeSettings({ themeMode: mode });
    const resolved = mode === 'system' ? getThemeMode() : mode;
    setPreviewTheme(resolved === 'dark' ? 'dark' : 'light');
  };

  const handleThemeToggle = (checked: boolean) => {
    const nextMode: TSettingsThemeMode = checked ? 'dark' : 'light';
    handleThemeSelect(nextMode);
  };

  const handleLogoFileChange = (key: BrandingLogoKey) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      event.target.value = '';
      return;
    }

    const previousUrl = objectUrlRef.current[key];
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    const nextPreview = URL.createObjectURL(file);
    objectUrlRef.current[key] = nextPreview;

    setLogoFiles((prev) => ({
      ...prev,
      [key]: file
    }));

    setLogoPreviews((prev) => ({
      ...prev,
      [key]: nextPreview
    }));

    event.target.value = '';
  };

  const handleLogoRemove = (key: BrandingLogoKey) => {
    const currentUrl = objectUrlRef.current[key];
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
      objectUrlRef.current[key] = null;
    }

    setLogoFiles((prev) => ({
      ...prev,
      [key]: null
    }));

    setLogoPreviews((prev) => ({
      ...prev,
      [key]: ''
    }));

    setBranding((prev) => ({
      ...prev,
      [key]: ''
    }));
  };

  const handleReset = () => {
    setBranding(settingsBranding);
    resetLogoState(settingsBranding);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('key', settings.configKey);
    formData.append('branding[app_name]', branding.app_name ?? '');
    formData.append('branding[layout]', branding.layout ?? DEFAULT_BRANDING_LAYOUT);

    const themeColor =
      branding.theme_color && branding.theme_color.length > 0
        ? branding.theme_color
        : DEFAULT_BRANDING_COLOR;
    formData.append('branding[theme_color]', themeColor);

    LOGO_KEYS.forEach((key) => {
      const currentValue = (branding[key] as string | undefined) ?? '';
      formData.append(`branding[${key}]`, currentValue);

      const file = logoFiles[key];
      if (file) {
        const fieldKey = `branding_${key}`;
        formData.append(fieldKey, file);
      }
    });

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/appsetting/${settings.configId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const responseBranding = mapBranding(data?.branding);
      updateSettings({ branding: responseBranding });
      resetLogoState(responseBranding);
      setBranding(responseBranding);
      toast.success('Branding settings updated successfully.');
    } catch (error) {
      console.error('Failed to update branding settings', error);
      toast.error('Unable to save branding changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const brandingForPreview = useMemo(() => {
    const previewBranding: TBranding = { ...branding };
    LOGO_KEYS.forEach((key) => {
      const previewValue = logoPreviews[key];
      if (previewValue !== undefined) {
        previewBranding[key] = previewValue;
      }
    });
    return previewBranding;
  }, [branding, logoPreviews]);

  const brandingAssets = useMemo(
    () => resolveBrandingAssets(brandingForPreview),
    [brandingForPreview]
  );

  const isBrandingDirty = useMemo(() => {
    const hasLogoFileChanges = LOGO_KEYS.some((key) => Boolean(logoFiles[key]));

    const hasLogoValueChanges = LOGO_KEYS.some((key) => {
      const currentValue = (branding[key] as string | undefined) ?? '';
      const initialValue = (settingsBranding[key] as string | undefined) ?? '';
      return currentValue !== initialValue;
    });

    return (
      (branding.app_name ?? '') !== (settingsBranding.app_name ?? '') ||
      (branding.layout ?? DEFAULT_BRANDING_LAYOUT) !==
        (settingsBranding.layout ?? DEFAULT_BRANDING_LAYOUT) ||
      (branding.theme_color ?? DEFAULT_BRANDING_COLOR) !==
        (settingsBranding.theme_color ?? DEFAULT_BRANDING_COLOR) ||
      hasLogoFileChanges ||
      hasLogoValueChanges
    );
  }, [branding, logoFiles, settingsBranding]);

  const appliedTheme = previewTheme === 'dark' ? 'dark' : 'light';
  const switchChecked = themeMode === 'system' ? previewTheme === 'dark' : themeMode === 'dark';

  const renderLogoUpload = (key: BrandingLogoKey) => {
    const { label, description } = LOGO_FIELD_CONFIG[key];
    const preview = logoPreviews[key];
    const currentFile = logoFiles[key];
    const savedValue = (branding[key] as string | undefined) ?? '';

    const showRemoveButton = Boolean(currentFile || savedValue);

    return (
      <div key={key} className="grid gap-2">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex h-16 w-28 items-center justify-center overflow-hidden rounded border border-dashed border-muted-foreground/30 bg-muted/10">
            {preview ? (
              <img
                src={preview}
                alt={`${label} preview`}
                className="max-h-full w-full object-contain"
              />
            ) : (
              <span className="text-xs text-muted-foreground">No preview</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Input type="file" accept="image/*" onChange={handleLogoFileChange(key)} />
            <p className="text-xs text-muted-foreground">{description}</p>
            {currentFile && (
              <p className="text-xs text-muted-foreground/80">Selected file: {currentFile.name}</p>
            )}
            {!currentFile && savedValue && (
              <p className="text-xs text-muted-foreground/80 break-all">Current: {savedValue}</p>
            )}
          </div>
          {showRemoveButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleLogoRemove(key)}
              className="self-start text-muted-foreground hover:text-foreground"
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="h-full">
      <Container className="py-6 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Branding</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Upload logo assets, choose accent colours and switch between light or dark themes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!isBrandingDirty || isSaving}
            >
              Reset
            </Button>
            <Button type="submit" disabled={!isBrandingDirty || isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Logo assets</CardTitle>
              <CardDescription>
                Provide the logo files that will be used across headers, sidebars and loader
                screens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <label htmlFor="app_name" className="text-sm font-medium text-muted-foreground">
                  Application name
                </label>
                <Input
                  id="app_name"
                  value={branding.app_name ?? ''}
                  onChange={handleInputChange('app_name')}
                  placeholder="APIToolz"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground">Default layout</label>
                <Select
                  value={branding.layout ?? DEFAULT_BRANDING_LAYOUT}
                  onValueChange={(value) =>
                    setBranding((prev) => ({
                      ...prev,
                      layout: value
                    }))
                  }
                >
                  <SelectTrigger className="w-full md:w-[220px]">
                    <SelectValue placeholder="Select a layout" />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the layout applied across the admin pages.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {(['logo_url', 'logo_small_url'] as BrandingLogoKey[]).map((key) =>
                  renderLogoUpload(key)
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {(['logo_dark_url', 'logo_dark_small_url'] as BrandingLogoKey[]).map((key) =>
                  renderLogoUpload(key)
                )}
              </div>

              <div className="grid gap-2">
                <label htmlFor="theme_color" className="text-sm font-medium text-muted-foreground">
                  Accent colour
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    id="theme_color"
                    value={branding.theme_color ?? DEFAULT_BRANDING_COLOR}
                    onChange={handleInputChange('theme_color')}
                    placeholder="#00A193"
                    className="max-w-[200px]"
                  />
                  <input
                    type="color"
                    aria-label="Pick accent colour"
                    value={branding.theme_color ?? DEFAULT_BRANDING_COLOR}
                    onChange={handleThemeColorChange}
                    className="h-10 w-12 cursor-pointer rounded border border-input bg-transparent p-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  The accent colour is displayed in previews and can be used for future theming.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Theme & preview</CardTitle>
              <CardDescription>
                Switch between light and dark modes and preview how your branding appears in each
                theme.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Theme mode</p>
                    <p className="text-xs text-muted-foreground">
                      Select the theme applied across the admin experience.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={switchChecked} onCheckedChange={handleThemeToggle} />
                    <Select
                      value={themeMode}
                      onValueChange={(value) => handleThemeSelect(value as TSettingsThemeMode)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Preview theme</p>
                    <p className="text-xs text-muted-foreground">
                      Toggle to preview your logos on a {previewTheme} background.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={previewTheme === 'dark'}
                      onCheckedChange={(checked) => setPreviewTheme(checked ? 'dark' : 'light')}
                    />
                    <span className="text-sm font-medium capitalize">{previewTheme}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div
                className={clsx(
                  'w-full rounded-lg border p-6 shadow-sm transition-colors',
                  appliedTheme === 'dark'
                    ? 'bg-slate-900 text-white border-slate-700'
                    : 'bg-white text-slate-900 border-slate-200'
                )}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <img
                      src={appliedTheme === 'dark' ? brandingAssets.logoDark : brandingAssets.logo}
                      alt="Logo preview"
                      className="h-10 w-auto"
                    />
                    <img
                      src={
                        appliedTheme === 'dark'
                          ? brandingAssets.logoDarkSmall
                          : brandingAssets.logoSmall
                      }
                      alt="Compact logo preview"
                      className="h-8 w-auto"
                    />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{brandingAssets.appName}</p>
                    <p className="text-sm text-muted-foreground/80">
                      {appliedTheme === 'dark'
                        ? 'Dark surfaces will use your dark-mode assets where available.'
                        : 'Light surfaces will use your primary assets.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium">Accent colour</span>
                    <span
                      className="h-8 w-8 rounded-full border border-white/40"
                      style={{ backgroundColor: brandingAssets.themeColor }}
                    ></span>
                    <span className="text-xs font-mono text-muted-foreground/80">
                      {brandingAssets.themeColor}
                    </span>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </Container>
    </form>
  );
};

export { BrandingPage };
