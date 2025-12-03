import Navbar from "@/components/Navbar";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: January 2024</p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using our installment payment service, you agree to be bound by these 
              Terms and Conditions. If you disagree with any part of these terms, you may not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Installment Plan Terms</h2>
            <p className="text-muted-foreground mb-3">
              Our installment plans allow you to pay for purchases over time:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Plans are available in 3, 6, or 12 month terms</li>
              <li>First payment is due at checkout</li>
              <li>Subsequent payments are automatically charged monthly</li>
              <li>Standard plans are interest-free</li>
              <li>Minimum purchase amount is $100</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Payment Obligations</h2>
            <p className="text-muted-foreground mb-3">
              You agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate payment information</li>
              <li>Maintain sufficient funds for scheduled payments</li>
              <li>Update payment methods if your card expires or is lost</li>
              <li>Pay any applicable late fees for missed payments</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Late Payments</h2>
            <p className="text-muted-foreground">
              If a scheduled payment fails, you will be notified immediately. You have 5 days to 
              update your payment method. After 5 days, a late fee of $25 may be applied. Continued 
              non-payment may result in collection actions and negative impact on your credit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Early Payoff</h2>
            <p className="text-muted-foreground">
              You may pay off your remaining balance at any time without penalty. Early payoff does 
              not entitle you to any refund of payments already made.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Returns and Refunds</h2>
            <p className="text-muted-foreground">
              Our standard return policy applies to all purchases. If you return a product purchased 
              with an installment plan, we will refund all payments made and cancel remaining installments. 
              Returns must be initiated within 30 days of delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Account Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account if you:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Fail to make payments as agreed</li>
              <li>Provide false or fraudulent information</li>
              <li>Violate these terms and conditions</li>
              <li>Engage in abusive behavior toward our staff</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              We are not liable for any indirect, incidental, special, or consequential damages arising 
              from your use of our service. Our total liability is limited to the amount you paid for 
              the specific product or service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Changes will be posted on this page 
              with an updated date. Continued use of our service after changes constitutes acceptance of 
              the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms & Conditions, please contact us at legal@installmentstore.com
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;
