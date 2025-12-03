import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { documentApi } from "@/lib/api";

interface Document {
  _id: string;
  type: string;
  url: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

interface CheckoutDocumentUploadProps {
  onDocumentsVerified: (verified: boolean) => void;
}

export const CheckoutDocumentUpload = ({ onDocumentsVerified }: CheckoutDocumentUploadProps) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch user documents
  const { data, isLoading } = useQuery({
    queryKey: ["checkout-documents"],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      return await documentApi.getMyDocuments(token);
    },
    enabled: !!token,
  });

  const documents: Document[] = data?.documents || [];
  const verificationStatus = data?.verificationStatus || "unverified";

  const documentTypes = [
    { value: "cnic_front", label: "CNIC Front Side", required: true },
    { value: "cnic_back", label: "CNIC Back Side", required: true },
    { value: "utility_bill", label: "Utility Bill", required: false },
    { value: "salary_slip", label: "Salary Slip", required: false },
    { value: "bank_statement", label: "Bank Statement", required: false },
    { value: "other", label: "Other Document", required: false },
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

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("type", selectedType);

      const result = await documentApi.upload(formData, token!);

      toast({
        title: "Document uploaded",
        description: result.message,
      });

      queryClient.invalidateQueries({ queryKey: ["checkout-documents"] });
      setSelectedFile(null);
      setSelectedType("");
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const result = await documentApi.delete(documentId, token!);

      toast({ 
        title: "Document deleted",
        description: result.message
      });
      queryClient.invalidateQueries({ queryKey: ["checkout-documents"] });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const requiredDocs = documentTypes.filter((dt) => dt.required);
  const uploadedRequiredDocs = requiredDocs.filter((dt) =>
    documents.some((doc) => doc.type === dt.value),
  );
  const progress = (uploadedRequiredDocs.length / requiredDocs.length) * 100;
  
  // Notify parent component about document verification status
  const isFullyVerified = progress === 100 && verificationStatus === "verified";
  onDocumentsVerified(isFullyVerified);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Identity Verification Documents</h3>
        <Badge variant="destructive">Required</Badge>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Upload your identification documents for verification. CNIC (both sides) is mandatory.
      </p>

      {/* Verification Status */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">Verification Status</p>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                verificationStatus === "verified"
                  ? "default"
                  : verificationStatus === "rejected"
                    ? "destructive"
                    : "secondary"
              }
            >
              {verificationStatus}
            </Badge>
            {verificationStatus === "pending" && (
              <span className="text-xs text-muted-foreground">
                Under review
              </span>
            )}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-2">Progress</p>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {uploadedRequiredDocs.length} of {requiredDocs.length} required
            documents
          </p>
        </div>
      </div>

      {/* Upload Section */}
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
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    disabled={documents.some(
                      (doc) => doc.type === type.value,
                    )}
                  >
                    {type.label} {type.required && "*"}
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
          {uploading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>

      {/* Required Documents Alert */}
      {progress < 100 && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Documents Required
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
              You must upload both sides of your CNIC to proceed with
              checkout.
            </p>
          </div>
        </div>
      )}

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Uploaded Documents</h4>
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(doc.status)}
                <div>
                  <p className="font-medium text-sm">
                    {documentTypes.find((t) => t.value === doc.type)?.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded on{" "}
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                  {doc.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">
                      Reason: {doc.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(doc.url, "_blank")}
                >
                  View
                </Button>
                {doc.status !== "approved" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Progress component (since it's used in the document upload section)
const Progress = ({ value, className }: { value: number; className?: string }) => {
  return (
    <div className={`w-full bg-secondary rounded-full h-2 ${className}`}>
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};