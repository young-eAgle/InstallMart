import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

export const AdminOrders = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const enabled = Boolean(token);

  const { data: ordersData } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminApi.orders(token as string),
    enabled,
  });

  const orders = ordersData?.orders ?? [];

  const handlePaymentStatus = async (
    orderId: string,
    status: "pending" | "verified" | "rejected",
  ) => {
    if (!token) return;
    try {
      await adminApi.updatePaymentStatus(orderId, status, token);
      toast({ title: "Payment status updated" });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    } catch (error) {
      toast({
        title: "Unable to update payment",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleInstallmentStatus = async (
    orderId: string,
    installmentId: string,
    status: "pending" | "paid" | "overdue",
  ) => {
    if (!token) return;
    try {
      await adminApi.updateInstallment(
        orderId,
        installmentId,
        { status },
        token,
      );
      toast({ title: "Installment updated" });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    } catch (error) {
      toast({
        title: "Unable to update installment",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders & Installments</CardTitle>
        <CardDescription>
          Verify payments and update installment statuses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No orders yet.
          </p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id || Math.random()}
              className="rounded-lg border p-4 space-y-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">
                    Order #{order.id?.slice(-6) || "N/A"} ·{" "}
                    {order.user?.fullName || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}{" "}
                    · {order.items?.length || 0} items
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">
                    {order.paymentMethod || "—"}
                  </Badge>
                  <Badge>Payment {order.paymentStatus || "—"}</Badge>
                  <Select
                    defaultValue={order.paymentStatus || "pending"}
                    onValueChange={(value) =>
                      handlePaymentStatus(
                        order.id || "",
                        value as "pending" | "verified" | "rejected",
                      )
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md bg-muted/40 p-3 text-sm">
                <p>
                  <span className="text-muted-foreground">
                    Reference:
                  </span>{" "}
                  {order.paymentReference || "—"}
                </p>
                {order.paymentProofUrl && (
                  <a
                    href={order.paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    View proof
                  </a>
                )}
              </div>

              <div className="space-y-2">
                {order.installments?.map((installment) => (
                  <div
                    key={installment._id || Math.random()}
                    className="flex flex-col gap-2 rounded-lg border bg-background px-3 py-2 text-sm md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        Due{" "}
                        {installment.dueDate
                          ? new Date(
                              installment.dueDate,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p className="text-muted-foreground">
                        Rs. {installment.amount?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          installment.status === "paid"
                            ? "default"
                            : installment.status === "overdue"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {installment.status || "pending"}
                      </Badge>
                      <Select
                        defaultValue={installment.status || "pending"}
                        onValueChange={(value) =>
                          handleInstallmentStatus(
                            order.id || "",
                            installment._id || "",
                            value as "pending" | "paid" | "overdue",
                          )
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            Pending
                          </SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">
                            Overdue
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};