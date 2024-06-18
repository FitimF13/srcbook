import { Form, useSubmit } from 'react-router-dom';
import { useRef, useState } from 'react';
import { FileCode, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiskResponseType, disk, importSrcbook } from '@/lib/server';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import type { FsObjectResultType, FsObjectType } from '@/types';
import useEffectOnce from './use-effect-once';

export default function FilePicker(props: {
  dirname: string;
  entries: FsObjectType[];
  cta: string;
}) {
  const [dirname, setDirname] = useState(props.dirname);
  const [entries, setEntries] = useState(props.entries);
  const [selected, setSelected] = useState<FsObjectType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const submit = useSubmit();

  async function onClick(entry: FsObjectType) {
    if (selected && selected.path === entry.path) {
      // Deselecting a file
      setSelected(null);
      setDirname(entry.dirname);
    } else if (!entry.isDirectory) {
      // Selecting a file
      setSelected(entry);
      setDirname(entry.dirname);
    } else {
      // Opening a directory
      setSelected(null);
      const { result } = await disk({ dirname: entry.path });
      setDirname(result.dirname);
      setEntries(result.entries);
    }
  }

  async function createSrcbookFromSrcmdFile() {
    if (selected === null || selected.isDirectory) {
      console.error('Cannot create srcbook from invalid selection. This is a bug in the code.');
      console.log('Selection:', selected);
      return;
    }

    setSubmitting(true);

    const { result } = await importSrcbook({ path: selected.path });

    inputRef.current!.value = result.dir;
    submit(formRef.current);
  }

  return (
    <div className="space-y-4 mt-4 w-full">
      <Form ref={formRef} method="post" className="flex items-center space-x-2 w-full">
        <Input value={selected?.path || dirname} name="srcmdpath" readOnly />
        <input ref={inputRef} type="hidden" name="path" value="" />
        <Button
          className="w-32"
          type="button"
          disabled={selected === null || submitting}
          onClick={createSrcbookFromSrcmdFile}
        >
          {props.cta}
        </Button>
      </Form>

      <ul className="flex flex-wrap max-h-[383px] overflow-y-scroll bg-gray-50 p-2 rounded">
        {entries.map((entry) => (
          <FsEntryItem
            key={entry.path}
            entry={entry}
            onClick={onClick}
            selected={selected !== null && selected.path === entry.path}
          />
        ))}
      </ul>
    </div>
  );
}

export function DirPicker(props: { dirname: string; entries: FsObjectType[]; cta: string }) {
  const [dirname, setDirname] = useState(props.dirname);
  const [entries, setEntries] = useState(props.entries.filter((entry) => entry.isDirectory));
  const [selected, setSelected] = useState<null | FsObjectType>(null);

  async function onClick(entry: FsObjectType) {
    setSelected(entry);
    const { result } = await disk({ dirname: entry.path });
    setDirname(result.dirname);
    setEntries(result.entries.filter((entry) => entry.isDirectory));
  }

  return (
    <div className="space-y-4 mt-4 w-full">
      <Form method="post" className="flex items-center space-x-2 w-full">
        <Input value={dirname} name="path" readOnly />
        <Button className="w-32" type="submit" disabled={selected === null}>
          {props.cta}
        </Button>
      </Form>

      <ul className="flex flex-wrap max-h-[383px] overflow-y-scroll bg-gray-50 p-2 rounded">
        {entries.map((entry) => (
          <FsEntryItem
            key={entry.path}
            entry={entry}
            onClick={onClick}
            selected={selected !== null && selected.path === entry.path}
          />
        ))}
      </ul>
    </div>
  );
}

function FsEntryItem({
  entry,
  onClick,
  selected,
  disabled,
}: {
  entry: FsObjectType;
  selected: boolean;
  disabled?: boolean;
  onClick: (entry: FsObjectType) => void;
}) {
  const Icon = entry.isDirectory ? Folder : FileCode;

  let classes: string;

  if (selected) {
    classes = 'cursor-pointer bg-accent text-accent-foreground';
  } else if (disabled) {
    classes = 'pointer-events-none';
  } else {
    classes = 'hover:bg-accent hover:text-accent-foreground';
  }

  return (
    <li className="text-sm w-1/2 md:w-1/3">
      <button
        className={cn('my-0.5 py-2 px-1 rounded w-full flex items-center cursor-pointer', classes)}
        disabled={disabled}
        onClick={() => onClick(entry)}
      >
        <Icon size={16} />
        <span className="ml-1.5 truncate">{entry.basename}</span>
      </button>
    </li>
  );
}

export function ExportLocationPicker(props: { onSave: (directory: string, path: string) => void }) {
  const filenameRef = useRef<HTMLInputElement | null>(null);
  const [filename, setFilename] = useState('untitled.srcmd');
  const [fsResult, setFsResult] = useState<FsObjectResultType>({ dirname: '', entries: [] });

  function onDiskResponse({ result }: DiskResponseType) {
    setFsResult(result);
  }

  useEffectOnce(() => {
    disk().then(onDiskResponse);

    const el = filenameRef.current;
    if (el) {
      el.setSelectionRange(0, el.value.length - '.srcmd'.length);
    }
  });

  const validFilename = /.+\.srcmd$/.test(filename);

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-1.5">
        <Input
          ref={filenameRef}
          className="mb-2"
          tabIndex={1}
          autoFocus
          defaultValue={filename}
          onChange={(e) => setFilename(e.currentTarget.value.trimEnd())}
        />
      </div>

      <div className="flex flex-col h-[383px] bg-gray-50 p-2 rounded border border-input overflow-y-scroll divide-y divide-dashed">
        <ul className="flex flex-wrap">
          {fsResult.entries.map((entry) => (
            <FsEntryItem
              key={entry.path}
              entry={entry}
              disabled={!entry.isDirectory}
              onClick={(entry) => disk({ dirname: entry.path }).then(onDiskResponse)}
              selected={false}
            />
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          {fsResult.dirname}/<span className="font-bold">{filename}</span>
        </div>
        <Button
          tabIndex={2}
          variant="default"
          disabled={!validFilename}
          onClick={() => props.onSave(fsResult.dirname, filename)}
        >
          Save
        </Button>
      </div>
    </div>
  );
}