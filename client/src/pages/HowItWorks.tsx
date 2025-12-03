import Navbar from "@/components/Navbar";
import { ShoppingCart, CreditCard, Calendar, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: ShoppingCart,
      title: "1. Browse & Select",
      description: "Choose from our wide selection of products and add your favorites to the cart."
    },
    {
      icon: CreditCard,
      title: "2. Choose Your Plan",
      description: "Select an installment plan that works for your budget - 3, 6, or 12 months."
    },
    {
      icon: Calendar,
      title: "3. Set Payment Schedule",
      description: "Approve your payment schedule with fixed monthly amounts and due dates."
    },
    {
      icon: CheckCircle,
      title: "4. Enjoy Your Purchase",
      description: "Get your products immediately and pay over time with automatic payments."
    }
  ];

  const faqs = [
    {
      question: "How do installment payments work?",
      answer: "Your total purchase amount is divided into equal monthly payments. You pay the first installment at checkout, and the remaining payments are automatically charged on the same day each month."
    },
    {
      question: "Are there any interest charges?",
      answer: "Our standard installment plans are interest-free! You pay only the product price divided across your chosen payment period."
    },
    {
      question: "What happens if I miss a payment?",
      answer: "We'll send you a reminder before each payment. If a payment fails, we'll notify you immediately and give you time to update your payment method."
    },
    {
      question: "Can I pay off early?",
      answer: "Yes! You can pay off your remaining balance at any time without penalties or fees."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Shop now, pay later with our simple 4-step process
          </p>
        </section>

        {/* Steps Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16 bg-card p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6 text-center">Why Choose Installments?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Budget Friendly</h3>
              <p className="text-muted-foreground">
                Spread your payments over time without straining your budget
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">No Hidden Fees</h3>
              <p className="text-muted-foreground">
                Transparent pricing with no surprise charges or hidden costs
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Instant Approval</h3>
              <p className="text-muted-foreground">
                Quick checkout process with immediate confirmation
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HowItWorks;
