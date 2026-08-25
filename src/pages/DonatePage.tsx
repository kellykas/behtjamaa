import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, HeartHandshake, DollarSign, Building2, MailCheck, BookOpen, BadgeCheck, Landmark, Copy, Check } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const amounts = [25, 50, 100, 250];

const impactAreas = [
  { icon: BookOpen, title: "Ministry Content", desc: "Producing quality sermons and teachings", color: "bg-blue-100 text-blue-600" },
  { icon: HeartHandshake, title: "Community Outreach", desc: "Supporting local and global missions", color: "bg-green-100 text-green-600" },
  { icon: Building2, title: "Church Operations", desc: "Maintaining facilities and equipment", color: "bg-purple-100 text-purple-600" },
];

const bankDetails = [
  { label: "Bank", value: "First National Bank" },
  { label: "Account", value: "BEHT JAMAA Ministry" },
  { label: "Routing", value: "123456789" },
];

const DonatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [copied, setCopied] = useState(false);

  const activeAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;

  const handleCopyRouting = () => {
    navigator.clipboard.writeText("123456789");
    setCopied(true);
    toast({ title: "Routing number copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <div className="text-center mb-14">
          <Badge className="mb-3">Support Our Ministry</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Donate</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your generous donations help us spread the Gospel, create meaningful content, and serve our community. Every contribution makes a difference.
          </p>
        </div>

        {/* Impact Areas */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-center mb-8">Your Impact</h2>
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {impactAreas.map((area) => (
              <Card key={area.title} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${area.color}`}>
                    <area.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold mb-1">{area.title}</h3>
                  <p className="text-sm text-muted-foreground">{area.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Scripture */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-3 text-amber-600" />
              <blockquote className="italic text-amber-800 leading-relaxed max-w-2xl mx-auto">
                &quot;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&quot;
              </blockquote>
              <p className="text-amber-700 font-semibold mt-2">2 Corinthians 9:7</p>
            </CardContent>
          </Card>
        </section>

        {/* Donation Form */}
        <section className="mb-14">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" /> Make a Donation
              </CardTitle>
              <p className="text-sm text-muted-foreground">Choose your donation amount and frequency</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Frequency */}
              <div className="space-y-2">
                <Label>Donation Frequency</Label>
                <div className="flex gap-2">
                  <Button
                    variant={frequency === "once" ? "default" : "outline"}
                    onClick={() => setFrequency("once")}
                    className="flex-1"
                  >
                    One-Time
                  </Button>
                  <Button
                    variant={frequency === "monthly" ? "default" : "outline"}
                    onClick={() => setFrequency("monthly")}
                    className="flex-1"
                  >
                    Monthly
                  </Button>
                </div>
              </div>

              {/* Amounts */}
              <div className="space-y-2">
                <Label>Donation Amount (USD)</Label>
                <div className="grid grid-cols-4 gap-3">
                  {amounts.map((amt) => (
                    <Button
                      key={amt}
                      variant={selectedAmount === amt && !customAmount ? "default" : "outline"}
                      onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                      className="text-lg"
                    >
                      ${amt}
                    </Button>
                  ))}
                </div>
                <div className="relative mt-3">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-9 text-lg"
                    min="1"
                  />
                </div>
              </div>

              {/* Summary */}
              {activeAmount > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Donation Amount:</span>
                    <span className="font-semibold">${activeAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-semibold">{frequency === "monthly" ? "Monthly" : "Once"}</span>
                  </div>
                </div>
              )}

              <Button size="lg" className="w-full" disabled={activeAmount <= 0}>
                Continue to Payment
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <BadgeCheck className="h-4 w-4" />
                Your donation is secure and tax-deductible. You will receive a receipt via email.
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Other Ways to Give */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-center mb-8">Other Ways to Give</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bank Transfer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Landmark className="h-5 w-5 text-blue-600" /> Bank Transfer
                </CardTitle>
                <p className="text-sm text-muted-foreground">For larger donations, you can transfer directly to our account:</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {bankDetails.map((d) => (
                  <div key={d.label} className="flex justify-between items-center bg-muted/50 rounded-lg px-4 py-2">
                    <span className="text-sm text-muted-foreground">{d.label}</span>
                    <span className="font-mono font-medium text-sm">{d.value}</span>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleCopyRouting}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Routing Number"}
                </Button>
              </CardContent>
            </Card>

            {/* Check / Mail */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MailCheck className="h-5 w-5 text-green-600" /> Check or Money Order
                </CardTitle>
                <p className="text-sm text-muted-foreground">Mail your donation to:</p>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <p className="font-semibold">BEHT JAMAA</p>
                  <p className="text-muted-foreground text-sm">123 Faith Avenue</p>
                  <p className="text-muted-foreground text-sm">City, State 12345</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Questions */}
        <section className="text-center py-8">
          <h2 className="text-xl font-bold mb-2">Questions?</h2>
          <p className="text-muted-foreground mb-4">Need help with your donation?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <a href="mailto:giving@behtjamaa.org" className="text-blue-600 hover:underline">
              Email: giving@behtjamaa.org
            </a>
            <a href="tel:+15551234567" className="text-blue-600 hover:underline">
              Phone: +1 (555) 123-4567
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DonatePage;
