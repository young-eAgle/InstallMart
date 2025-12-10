import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface GuestDocument {
  type: string;
  file: File;
}

interface GuestDocumentUploadProps {
  orderId: string;
  onComplete: () => void;
}

export const GuestDocumentUpload = ({ orderId, onComplete }: GuestDocumentUploadProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<GuestDocument[]>([]);

  const documentTypes = [
    { value: "cnic_front", label: "CNIC Front Side" },
    { value: "cnic_back", label: "CNIC Back Side" },
    { value: "utility_bill", label: "Utility Bill" },
    { value: "salary_slip", label: "Salary Slip" },
    { value: "bank_statement", label: "Bank Statement" },
    { value: "other", label: "Other Document" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedType) {
      toast({
        title: "Missing information",
        description: "Please select document type and file",
        variant: "destructive",
      });
      return;
    }

    // For now, we'll just simulate the upload and store locally
    // In a real implementation, this would connect to a backend endpoint
    setUploading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to uploaded documents
      const newDocument: GuestDocument = {
        type: selectedType,
        file: selectedFile,
      };
      
      setUploadedDocuments(prev => [...prev, newDocument]);
      
      toast({
        title: "Document added",
        description: "Document will be processed with your order",
      });
      
      // Reset form
      setSelectedFile(null);
      setSelectedType("");
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to add document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitDocuments = async () => {
    if (uploadedDocuments.length === 0) {
      toast({
        title: "No documents",
        description: "Please upload at least one document",
        variant: "destructive",
      });
      return;
    }

    // Simulate final submission
    setUploading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Documents submitted",
        description: "Your documents have been submitted successfully. You will receive a confirmation email shortly.",
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Failed to submit documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Identity Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          <p>
            As a guest user, please upload your identification documents to complete your order verification.
            These documents will be securely processed and associated with your order #{orderId}.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Document Type *</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Upload File *</Label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)}{" "}
                  KB)
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedType || uploading}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Adding..." : "Add Document"}
          </Button>
        </div>

        {/* Uploaded Documents */}
        {uploadedDocuments.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Documents to Submit</h4>
            {uploadedDocuments.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">
                      {documentTypes.find((t) => t.value === doc.type)?.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.file.name}
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        {uploadedDocuments.length > 0 && (
          <div className="pt-4">
            <Button
              onClick={handleSubmitDocuments}
              disabled={uploading}
              className="w-full gradient-accent"
            >
              {uploading ? "Submitting Documents..." : "Submit All Documents"}
            </Button>
          </div>
        )}

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Important Notice
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Your documents will be reviewed by our team within 24-48 hours. 
              You can track the status of your order using the order number provided in your confirmation email.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};