import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon, Loader2Icon } from "lucide-react";

type Props = {
  status: "idle" | "exporting" | "done";
  title: string;
  description: string;
};

export default function ExportAlert({ status, title, description }: Props) {
  if (status === "idle") return null;

  if (status === "exporting") {
    return (
      <Alert className="mb-4 border-lime-400/50 bg-lime-400/30">
        <Loader2Icon className="h-4 w-4 animate-spin text-lime-400" />
        <AlertTitle className="text-lime-400">{title}</AlertTitle>
        <AlertDescription className="text-white">
          {description}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-lime-400 bg-lime-400/15">
      <CheckCircle2Icon className="h-4 w-4 text-lime-400" />
      <AlertTitle className="text-lime-400">{title}</AlertTitle>
      <AlertDescription className="text-white">{description}</AlertDescription>
    </Alert>
  );
}
