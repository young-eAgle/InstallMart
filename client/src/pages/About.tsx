import Navbar from "@/components/Navbar";
import { Shield, Clock, Users, Award } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Your financial information is protected with bank-level encryption"
    },
    {
      icon: Clock,
      title: "Flexible Plans",
      description: "Choose installment plans that fit your budget and lifestyle"
    },
    {
      icon: Users,
      title: "Customer First",
      description: "Dedicated support team ready to help you every step of the way"
    },
    {
      icon: Award,
      title: "Trusted Service",
      description: "Years of experience helping customers achieve their purchase goals"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to make premium products accessible to everyone through 
            flexible installment plans that fit your budget.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16 bg-card p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground mb-4">
            We believe everyone deserves access to quality products without the burden of 
            immediate full payment. Our installment platform empowers you to buy what you 
            need today and pay over time with transparent, interest-free plans.
          </p>
          <p className="text-lg text-muted-foreground">
            Founded on principles of financial inclusion and customer empowerment, we've 
            helped thousands of customers achieve their purchase goals while maintaining 
            their financial health.
          </p>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-card p-6 rounded-lg text-center">
                <value.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-6">Our Commitment</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We're committed to transparency, security, and exceptional customer service. 
            Every decision we make is guided by our dedication to helping you shop smarter 
            and achieve your goals without financial stress.
          </p>
        </section>
      </main>
    </div>
  );
};

export default About;
