'use client';

import Dialog from '@/components/ui/Dialog';

const groups: { title: string; keys: [string[], string][] }[] = [
  {
    title: 'Anywhere',
    keys: [
      [['?'], 'Show this list'],
      [['/'], 'Focus the URL field or search'],
    ],
  },
  {
    title: 'Shorten',
    keys: [
      [['Ctrl', 'V'], 'Paste a URL without clicking the field'],
      [['Enter'], 'Shorten'],
      [['c'], 'Copy the new short link'],
    ],
  },
  {
    title: 'Stats',
    keys: [
      [['j'], 'Next link'],
      [['k'], 'Previous link'],
      [['Enter'], 'Open link details'],
      [['c'], 'Copy selected short link'],
    ],
  },
];

export default function ShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Keyboard shortcuts">
      <div className="space-y-5">
        {groups.map((group) => (
          <section key={group.title}>
            <h3 className="mb-2 text-[13px] text-muted">{group.title}</h3>
            <dl className="space-y-1.5 text-sm">
              {group.keys.map(([combo, label]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4"
                >
                  <dt>{label}</dt>
                  <dd className="flex gap-1">
                    {combo.map((k) => (
                      <kbd key={k} className="kbd">
                        {k}
                      </kbd>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Dialog>
  );
}
