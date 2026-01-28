import Header from "@/components/Header";
import { Save, Eye, EyeOff, Lock, Bell, Shield } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [formData, setFormData] = useState({
    handle: "current_user",
    email: "user@example.com",
    bio: "Systems engineer. Distributed systems enthusiast. OSS contributor.",
    website: "https://example.com",
    twitter: "@userhandle",
    github: "github.com/user",
  });

  const [domains, setDomains] = useState([
    "Distributed Systems",
    "Backend Architecture",
    "Security",
  ]);

  const [domainInput, setDomainInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addDomain = () => {
    if (domainInput.trim() && !domains.includes(domainInput)) {
      setDomains([...domains, domainInput]);
      setDomainInput("");
    }
  };

  const removeDomain = (domain: string) => {
    setDomains(domains.filter((d) => d !== domain));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-8">Account Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold">
              Profile
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              Notifications
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              Privacy & Security
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              API Keys
            </button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <section className="border border-border rounded-xl p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Profile Information
              </h2>

              <div className="space-y-6">
                {/* Handle */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    name="handle"
                    value={formData.handle}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your public identifier. Cannot be changed after creation.
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tell others about yourself. Up to 200 characters.
                  </p>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Twitter
                    </label>
                    <input
                      type="text"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleChange}
                      placeholder="@handle"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    GitHub
                  </label>
                  <input
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="github.com/username"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </section>

            {/* Expertise Domains */}
            <section className="border border-border rounded-xl p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Areas of Expertise
              </h2>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addDomain()}
                    placeholder="Add a domain..."
                    className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={addDomain}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {domains.map((domain) => (
                    <div
                      key={domain}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      <span>{domain}</span>
                      <button
                        onClick={() => removeDomain(domain)}
                        className="hover:text-primary/70 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Add domains where you have expertise. This helps reviewers identify
                  your areas of knowledge.
                </p>
              </div>
            </section>

            {/* Security */}
            <section className="border border-border rounded-xl p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Password
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                      Change
                    </button>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add an extra layer of security to your account
                      </p>
                      <button className="text-primary font-medium hover:underline text-sm">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <button className="px-6 py-2 border border-border rounded-lg font-medium text-foreground hover:bg-secondary transition-colors">
                Cancel
              </button>
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
