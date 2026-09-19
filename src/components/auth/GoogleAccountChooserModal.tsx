import { useState, useEffect } from "react";
import { X, UserPlus, Check, Trash2, ArrowRight, ShieldCheck, Mail, Loader2 } from "lucide-react";

export interface GoogleAccount {
  email: string;
  name: string;
  avatar?: string;
  lastUsed?: string;
}

const STORAGE_KEY = "ignite_saved_gmail_accounts";

export function getSavedGoogleAccounts(): GoogleAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  // Default accounts for instant developer/testing suggestion
  return [
    {
      name: "Alex Rivera",
      email: "alex.rivera@gmail.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      lastUsed: "Recently used",
    },
  ];
}

export function saveGoogleAccount(account: GoogleAccount) {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedGoogleAccounts();
    const filtered = existing.filter((a) => a.email.toLowerCase() !== account.email.toLowerCase());
    const updated = [
      {
        ...account,
        lastUsed: "Just now",
      },
      ...filtered,
    ].slice(0, 5); // Keep top 5
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function removeGoogleAccount(email: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedGoogleAccounts();
    const updated = existing.filter((a) => a.email.toLowerCase() !== email.toLowerCase());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleAccount) => Promise<void>;
}

export function GoogleAccountChooserModal({
  isOpen,
  onClose,
  onSelectAccount,
}: GoogleAccountChooserModalProps) {
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [connectingEmail, setConnectingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAccounts(getSavedGoogleAccounts());
      setIsAddingNew(false);
      setNewEmail("");
      setNewName("");
      setError(null);
      setConnectingEmail(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = async (account: GoogleAccount) => {
    setConnectingEmail(account.email);
    setError(null);
    try {
      saveGoogleAccount(account);
      await onSelectAccount(account);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to connect to Google account.");
      setConnectingEmail(null);
    }
  };

  const handleAddNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let email = newEmail.trim().toLowerCase();
    if (!email) {
      setError("Please enter a Gmail or Google Workspace email address");
      return;
    }
    if (!email.includes("@")) {
      email = `${email}@gmail.com`;
    }

    const name = newName.trim() || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const account: GoogleAccount = {
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      lastUsed: "Just now",
    };

    await handleSelect(account);
  };

  const handleRemove = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    removeGoogleAccount(email);
    setAccounts(getSavedGoogleAccounts());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-[440px] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden text-card-foreground animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Google Logo */}
        <div className="p-6 pb-4 border-b border-border/60 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-3">
            <svg className="size-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Google Account
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">Choose an account</h2>
          <p className="text-xs text-muted-foreground mt-1">
            to continue to <span className="font-medium text-foreground">Enginow Ignite</span>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}

        {/* Account List View */}
        {!isAddingNew ? (
          <div className="p-4 space-y-2 max-h-[340px] overflow-y-auto">
            {accounts.map((acc) => {
              const isConnecting = connectingEmail === acc.email;
              return (
                <button
                  key={acc.email}
                  type="button"
                  disabled={!!connectingEmail}
                  onClick={() => handleSelect(acc)}
                  className="w-full group p-3.5 rounded-2xl flex items-center gap-3.5 hover:bg-secondary/70 border border-transparent hover:border-border transition-all text-left relative disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={acc.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.name)}`}
                      alt={acc.name}
                      className="size-11 rounded-full object-cover border border-border"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-white dark:bg-neutral-900 border border-border flex items-center justify-center">
                      <div className="size-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate flex items-center gap-2">
                      <span>{acc.name}</span>
                      {acc.lastUsed && (
                        <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground">
                          {acc.lastUsed}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{acc.email}</div>
                  </div>

                  {/* Status / Loader / Remove */}
                  {isConnecting ? (
                    <Loader2 className="size-5 animate-spin text-primary shrink-0" />
                  ) : (
                    <button
                      type="button"
                      title="Remove from suggestion list"
                      onClick={(e) => handleRemove(e, acc.email)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-opacity"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </button>
              );
            })}

            {/* Use Another Account Button */}
            <button
              type="button"
              disabled={!!connectingEmail}
              onClick={() => setIsAddingNew(true)}
              className="w-full p-3.5 rounded-2xl flex items-center gap-3.5 hover:bg-secondary/70 border border-dashed border-border transition-all text-left text-sm font-medium text-primary hover:text-primary/90 mt-2"
            >
              <div className="size-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <UserPlus className="size-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Use another Google account</div>
                <div className="text-xs text-muted-foreground">Sign in with any other Gmail ID</div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          /* Enter Another Account View */
          <form onSubmit={handleAddNewSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Gmail ID / Google Account Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="yourname@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full h-11 bg-background border border-border rounded-xl px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors pr-24"
                />
                {!newEmail.includes("@") && newEmail.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setNewEmail((prev) => `${prev}@gmail.com`)}
                    className="absolute right-2 top-2 px-2 py-1 bg-secondary hover:bg-secondary/80 rounded-lg text-[11px] font-medium text-primary transition-colors"
                  >
                    +@gmail.com
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Enter your Gmail username or full email address.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Display Name (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Rivera"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full h-11 bg-background border border-border rounded-xl px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="flex-1 h-11 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-sm font-semibold transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!!connectingEmail || !newEmail.trim()}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {connectingEmail ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Connect & Sign In</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer Info */}
        <div className="p-4 bg-secondary/40 border-t border-border/60 text-center">
          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-center justify-center gap-1.5">
            <ShieldCheck className="size-3.5 text-primary shrink-0" />
            <span>
              Google identity verifies your email and connects securely with Ignite.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
