import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, AlertCircle } from "lucide-react";

interface GuestDocumentReminderProps {
  onUploadDocuments: () => void;
}

export const GuestDocumentReminder = ({ onUploadDocuments }: GuestDocumentReminderProps) => {
  return (
    <Card className="mb-8 border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          <AlertCircle className="h-5 w-5" />
          Document Upload Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          To complete your order verification, please upload your identification documents.
        </p>
        
        <div className="bg-white dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Required Documents</h4>
          <ul className="text-sm space-y-1 text-yellow-700 dark:text-yellow-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
              CNIC Front Side
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
              CNIC Back Side
            </li>
          </ul>
        </div>
        
        <Button 
          onClick={onUploadDocuments}
          className="w-full gradient-accent"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Documents Now
        </Button>
        
        <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
          You can also upload these documents later by visiting the "Track Order" page
        </p>
      </CardContent>
    </Card>
  );
};