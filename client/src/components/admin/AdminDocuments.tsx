import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
} from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/";

interface Document {
  _id: string;
  type: string;
  url: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

interface UserWithDocuments {
  id: string;
  fullName: string;
  email: string;
  documents: Document[];
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  documentsVerified: boolean;
  createdAt: string;
}

export const AdminDocuments = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");

  // Fetch all users with documents
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "user-documents"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/documents/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user documents");
      return res.json();
    },
    enabled: !!token,
  });

  const users: UserWithDocuments[] = data?.users || [];

  const handleDocumentStatusUpdate = async (
    userId: string,
    documentId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/documents/${userId}/${documentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, rejectionReason }),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast({
        title: "Document status updated",
        description: `Document has been ${status}`,
      });

      queryClient.invalidateQueries({ queryKey: ["admin", "user-documents"] });
      setRejectionReason("");
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
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

  const documentTypes: Record<string, string> = {
    cnic_front: "CNIC Front Side",
    cnic_back: "CNIC Back Side",
    utility_bill: "Utility Bill",
    salary_slip: "Salary Slip",
    bank_statement: "Bank Statement",
    other: "Other Document",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            User Document Verification
          </CardTitle>
          <CardDescription>
            Review and verify identity documents uploaded by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading user documents...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">No users with documents found.</p>
          ) : (
            <div className="space-y-6">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="bg-muted p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{user.fullName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          user.verificationStatus === "verified"
                            ? "default"
                            : user.verificationStatus === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {user.verificationStatus}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {user.documents.length} documents
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {user.documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getStatusIcon(doc.status)}
                          <div>
                            <p className="font-medium text-sm">
                              {documentTypes[doc.type] || doc.type}
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
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>

                          {doc.status === "pending" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  handleDocumentStatusUpdate(
                                    user.id,
                                    doc._id,
                                    "approved",
                                  )
                                }
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDocumentStatusUpdate(
                                    user.id,
                                    doc._id,
                                    "rejected",
                                  )
                                }
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};