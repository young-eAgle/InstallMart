import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import type { AuthUser } from "@/types";

export const AdminCustomers = () => {
  const { token } = useAuth();

  const enabled = Boolean(token);

  const { data: usersData } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminApi.users(token as string),
    enabled,
  });

  const customers = (usersData?.users ?? []).filter(
    (profile: AuthUser) => profile.role === "customer",
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>Overview of registered users</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {customers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No customers yet.
          </p>
        ) : (
          customers.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold">{profile.fullName}</p>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
              >
                <CheckCircle2 className="h-3 w-3" />
                Customer
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};