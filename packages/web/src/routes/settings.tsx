import { disk, getConfig, updateConfig } from '@/lib//server';
import { type CodeLanguageType } from '@srcbook/shared';
import type { SettingsType, FsObjectResultType } from '@/types';
import { useLoaderData } from 'react-router-dom';
import { DirPicker } from '@/components/file-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

async function loader() {
  const [{ result: config }, { result: diskResult }] = await Promise.all([getConfig(), disk({})]);

  return { defaultLanguage: config.defaultLanguage, baseDir: config.baseDir, ...diskResult };
}

async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const baseDir = formData.get('path') as string | undefined;
  const defaultLanguage = formData.get('default-language') as CodeLanguageType | undefined;
  await updateConfig({ baseDir, defaultLanguage });
  return null;
}

function Settings() {
  const { entries, baseDir, defaultLanguage } = useLoaderData() as SettingsType &
    FsObjectResultType;

  const updateDefaultLanguage = async (value: CodeLanguageType) => {
    await updateConfig({ defaultLanguage: value });
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl pb-4">Settings</h1>
        <h2 className="text-xl pb-2">Base Directory</h2>
        <label className="opacity-70">
          The default directory to look for Srcbooks when importing.
        </label>
        <DirPicker dirname={baseDir} entries={entries} cta="Change" />
      </div>

      <div>
        <h2 className="text-xl pb-2">Default Language</h2>
        <label className="opacity-70 block pb-2">
          The default language to use when creating new Srcbooks.
        </label>
        <Select onValueChange={updateDefaultLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={defaultLanguage} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="typescript">typescript</SelectItem>
            <SelectItem value="javascript">javascript</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

Settings.loader = loader;
Settings.action = action;
export default Settings;