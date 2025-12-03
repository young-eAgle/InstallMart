import Navbar from "@/components/Navbar";
import { Package, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";

const Returns = () => {
  const returnProcess = [
    {
      step: 1,
      title: "Request Return",
      description: "Log into your account and initiate a return request within 30 days of delivery",
      icon: Package
    },
    {
      step: 2,
      title: "Pack Your Item",
      description: "Securely pack the item in its original packaging with all accessories",
      icon: Package
    },
    {
      step: 3,
      title: "Ship It Back",
      description: "Use the prepaid shipping label we provide to send the item back",
      icon: RotateCcw
    },
    {
      step: 4,
      title: "Get Your Refund",
      description: "Receive your refund within 5-7 business days after we receive the item",
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Return Policy</h1>
            <p className="text-xl text-muted-foreground">
              We want you to be completely satisfied with your purchase
            </p>
          </section>

          {/* Key Points */}
          <section className="mb-12 bg-card p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Return Policy Highlights</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">30-Day Return Window</h3>
                  <p className="text-muted-foreground">
                    Return items within 30 days of delivery for a full refund
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Free Return Shipping</h3>
                  <p className="text-muted-foreground">
                    We provide prepaid shipping labels for all returns
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Full Refund Guarantee</h3>
                  <p className="text-muted-foreground">
                    Get a complete refund including all installment payments made
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Installments Cancelled</h3>
                  <p className="text-muted-foreground">
                    All remaining installment payments are automatically cancelled
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Return Process */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center">How to Return an Item</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {returnProcess.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-sm font-semibold text-primary mb-2">Step {item.step}</div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Eligibility */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Return Eligibility</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Items That Can Be Returned
                </h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Unused items in original packaging</li>
                  <li>Items with all original tags and accessories</li>
                  <li>Products in resalable condition</li>
                  <li>Items returned within 30 days of delivery</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Non-Returnable Items
                </h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Personalized or customized products</li>
                  <li>Items marked as "Final Sale"</li>
                  <li>Products damaged due to misuse</li>
                  <li>Items without original packaging</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Refund Information */}
          <section className="mb-12 bg-card p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Refund Information</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Installment Purchases:</strong> If you purchased 
                an item using an installment plan, we will refund all payments you've already made and 
                cancel all future scheduled payments. Refunds are processed within 5-7 business days 
                after we receive and inspect the returned item.
              </p>
              <p>
                <strong className="text-foreground">Refund Method:</strong> Refunds are issued to the 
                original payment method used for the purchase. It may take an additional 3-5 business 
                days for the refund to appear in your account, depending on your financial institution.
              </p>
              <p>
                <strong className="text-foreground">Partial Payments:</strong> If you've made multiple 
                installment payments, each payment will be refunded separately to the card used for that 
                specific payment.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="text-center bg-primary/5 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Our customer support team is here to assist with returns and refunds
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
              <a 
                href="/dashboard" 
                className="inline-block bg-card text-foreground px-6 py-3 rounded-lg font-semibold border hover:bg-muted transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Returns;
