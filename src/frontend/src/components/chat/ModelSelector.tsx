import { Sparkles } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODEL_LABELS, type Model } from "@/types/chat";

interface ModelSelectorProps {
  value: Model;
  onChange: (model: Model) => void;
}

const MODELS = Object.keys(MODEL_LABELS) as Model[];

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Model)}>
      <SelectTrigger
        size="sm"
        data-ocid="chat.model.select"
        className="w-[150px] gap-1.5 border-border/60 bg-card/60 backdrop-blur"
        aria-label="Select AI model"
      >
        <Sparkles className="size-3.5 text-primary" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MODELS.map((m) => (
          <SelectItem key={m} value={m} data-ocid={`chat.model.item.${m}`}>
            {MODEL_LABELS[m]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
