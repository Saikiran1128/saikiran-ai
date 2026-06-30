import {
  BookOpen,
  Bot,
  Code,
  FileText,
  Globe,
  ImageIcon,
  Mail,
  Microscope,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODE_LABELS, type Mode } from "@/types/chat";

interface ModeSelectorProps {
  value: Mode;
  onChange: (mode: Mode) => void;
}

const MODE_ICONS: Record<Mode, LucideIcon> = {
  normal: Bot,
  knowledgeBase: BookOpen,
  internetSearch: Globe,
  youtubeSearch: Youtube,
  codingAssistant: Code,
  emailAssistant: Mail,
  documentAssistant: FileText,
  imageAnalysis: ImageIcon,
  research: Microscope,
};

const MODES = Object.keys(MODE_LABELS) as Mode[];

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const Icon = MODE_ICONS[value];
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Mode)}>
      <SelectTrigger
        size="sm"
        data-ocid="chat.mode.select"
        className="w-[170px] gap-1.5 border-border/60 bg-card/60 backdrop-blur"
        aria-label="Select AI mode"
      >
        <Icon className="size-3.5 text-accent" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MODES.map((m) => {
          const MIcon = MODE_ICONS[m];
          return (
            <SelectItem key={m} value={m} data-ocid={`chat.mode.item.${m}`}>
              <span className="flex items-center gap-2">
                <MIcon className="size-3.5" aria-hidden />
                {MODE_LABELS[m]}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
