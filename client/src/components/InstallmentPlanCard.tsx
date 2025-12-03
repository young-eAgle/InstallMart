import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InstallmentPlanCardProps {
  months: number;
  totalPrice: number;
  monthlyPayment: number;
  isPopular?: boolean;
}

const InstallmentPlanCard = ({ months, totalPrice, monthlyPayment, isPopular }: InstallmentPlanCardProps) => {
  return (
    <Card className={`relative overflow-hidden transition-smooth hover:shadow-card-hover ${
      isPopular ? 'border-primary shadow-glow' : ''
    }`}>
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
      )}
      
      <CardHeader className="text-center pb-4">
        {isPopular && (
          <Badge className="w-fit mx-auto mb-2 gradient-accent">
            Most Popular
          </Badge>
        )}
        <CardTitle className="text-3xl font-bold">
          {months} Months
        </CardTitle>
        <CardDescription>Flexible payment plan</CardDescription>
      </CardHeader>
      
      <CardContent className="text-center space-y-6">
        <div>
          <div className="text-4xl font-bold text-primary mb-2">
            Rs. {monthlyPayment.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">per month</p>
        </div>
        
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Check className="h-4 w-4 text-accent" />
            <span>Total: Rs. {totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <Check className="h-4 w-4 text-accent" />
            <span>Zero down payment</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <Check className="h-4 w-4 text-accent" />
            <span>Flexible due dates</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <Check className="h-4 w-4 text-accent" />
            <span>Multiple payment options</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className={`w-full ${isPopular ? 'gradient-primary shadow-glow' : ''}`}
          variant={isPopular ? 'default' : 'outline'}
        >
          Select Plan
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InstallmentPlanCard;
