'use client';

import ShortenForm from '@/components/shorten/ShortenForm';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { Link2, MousePointerClick, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Link2,
    title: 'Paste your URL',
    description: 'Enter any long http or https link you want to share.',
  },
  {
    icon: Sparkles,
    title: 'Get a short link',
    description: 'Optionally set a custom alias or use an auto-generated key.',
  },
  {
    icon: MousePointerClick,
    title: 'Track clicks',
    description: 'Monitor performance in the Statistics dashboard.',
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl space-y-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-center max-w-2xl mx-auto"
      >
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 mb-6">
          <Link2 className="h-7 w-7 text-accent" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
          Shorten your links
        </h1>
        <p className="text-muted text-base leading-relaxed">
          Create short URLs, share them anywhere, and track every click — all on
          your own infrastructure.
        </p>
        <div className="mt-4 flex justify-center">
          <Badge className="bg-accent-muted/80 text-accent border-accent/30">
            Self-hosted
          </Badge>
        </div>
      </motion.div>

      <ShortenForm />

      <div>
        <h2 className="text-center text-sm font-medium uppercase tracking-wide text-muted mb-8">
          How it works
        </h2>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-border/80" />
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
            >
              <Card className="relative text-center h-full">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent mb-4">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="inline-flex rounded-xl bg-accent/10 p-2.5 mb-3">
                  <step.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {step.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
