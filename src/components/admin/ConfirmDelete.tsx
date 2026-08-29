import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/** ডিলিট করার আগে বাংলা কনফার্মেশন অ্যালার্ট */
export function ConfirmDelete({
  onConfirm,
  itemName,
  description,
}: {
  onConfirm: () => void;
  itemName?: string;
  description?: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="মুছুন">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">আপনি কি নিশ্চিত?</AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              `${itemName ? `“${itemName}” ` : "এই আইটেমটি "}স্থায়ীভাবে মুছে যাবে। এই কাজটি আর ফেরানো যাবে না।`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">বাতিল</AlertDialogCancel>
          <AlertDialogAction
            className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            হ্যাঁ, মুছে ফেলুন
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
