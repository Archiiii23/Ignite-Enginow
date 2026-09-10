import { Github, Instagram, Linkedin, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";

const cols = [
  {
    title: "Platform",
    links: ["Events", "Resources", "Careers", "About", "Contact"],
  },
  {
    title: "For Achievers",
    links: ["Join Events", "Certificates", "Bookmarks", "Resources", "Profile"],
  },
  {
    title: "For Igniters",
    links: ["Hosting Guidelines", "Event Checklist", "Organizer Handbook", "Volunteer Guide"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms", "Refund Policy", "Community Guidelines"],
  },
];

export function Footer() {
  return (
    <footer id="contact" className="pt-16 pb-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface/60 backdrop-blur border border-foreground/10 rounded-[2rem] p-8 md:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-14 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <img src={logo} alt="Enginow Ignite" width={32} height={32} className="size-8" />
                <span className="text-lg font-semibold tracking-tight">
                  Enginow <span className="text-muted-foreground">Ignite</span>
                </span>
              </div>
              <p className="text-muted-foreground max-w-[42ch] leading-relaxed">
                The architectural foundation for global technical communities. Built for scale.
                Designed for impact.
              </p>
              <div className="mt-8 flex gap-2">
                {[Linkedin, Instagram, Github, Youtube].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="size-10 rounded-full bg-foreground/5 border border-foreground/10 grid place-items-center hover:bg-foreground/10 hover:text-primary-glow transition-colors text-muted-foreground"
                    aria-label="Social link"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {cols.map((col) => (
                <div key={col.title} className="flex flex-col gap-5">
                  <span className="text-eyebrow text-muted-foreground">
                    {col.title}
                  </span>
                  <ul className="flex flex-col gap-3 text-sm text-foreground/80">
                    {col.links.map((l) => (
                      <li key={l}>
                        <a href="#" className="hover:text-foreground transition-colors">
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-10 flex flex-col md:flex-row justify-between gap-8">
            <div className="flex flex-col gap-4 max-w-md w-full">
              <span className="text-eyebrow text-muted-foreground">
                Newsletter
              </span>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex gap-2 p-1.5 bg-background rounded-xl border border-foreground/10"
              >
                <input
                  type="email"
                  required
                  placeholder="you@building.com"
                  className="bg-transparent text-sm px-3 focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="bg-foreground text-background text-xs font-medium px-4 py-2 rounded-lg hover:bg-foreground/90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
            <div className="flex items-end text-caption">
              © {new Date().getFullYear()} Enginow Ignite. Ignite Ideas. Build Communities. Create Impact.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
