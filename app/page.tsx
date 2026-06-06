'use client';

import ShortenForm from '@/components/shorten/ShortenForm';
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
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-2xl mx-auto"
      >
        <div className="inline-flex rounded-xl bg-accent/10 border border-accent/20 p-3 mb-5">
          <Link2 className="h-8 w-8 text-accent" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Shorten your links
        </h1>
        <p className="text-muted">
          Create short URLs, share them anywhere, and track every click. Fully
          self-hosted on your infrastructure.
        </p>
      </motion.div>

      <ShortenForm />

      <div className="max-w-4xl mx-auto">
        <h2 className="text-center text-lg font-semibold text-foreground mb-6">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Card className="text-center h-full">
                <div className="inline-flex rounded-lg bg-background border border-border p-2.5 mb-3">
                  <step.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
