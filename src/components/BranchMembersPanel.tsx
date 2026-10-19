import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, KeyRound, Mail, Phone, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { callAdminUsersApi, generatePassword } from "@/lib/adminUsers";
import {
  branchNameFor,
  buildMemberRoster,
  memberDisplayName,
  pendingJoinRequests,
  profilesByUserId,
  roleLabel,
  type RosterMember,
} from "@/lib/branchMembers";

interface BranchMembersPanelProps {
  /**
   * Branches this admin may manage. A super admin receives every branch id, so
   * an empty list really does mean "no branch".
   */
  branchIds: string[];
  /** Used for the branch picker and the branch badge on each member. */
  branches?: { id: string; name?: string | null }[];
  /** Called after a write so the parent can refresh its own counters. */
  onChange?: () => void;
}

const ROLES = ["member", "leader", "branch_admin"] as const;

const emptyForm = (branchId: string) => ({
  branchId,
  name: "",
  email: "",
  phone: "",
  note: "",
});

const BranchMembersPanel = ({ branchIds, branches, onChange }: BranchMembersPanelProps) => {
  const { toast } = useToast();
  const { isSuperAdmin } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const defaultBranchId = branchIds.length === 1 ? branchIds[0] : "";
  const [form, setForm] = useState(emptyForm(defaultBranchId));

  // Every row is fetched once and scoped client-side, so changing the managed
  // branches never needs another round trip.
  const load = useCallback(async () => {
    setLoading(true);
    const [memRes, reqRes, profRes] = await Promise.all([
      supabase.from("branch_members").select("*").order("joined_at", { ascending: false }),
      supabase.from("membership_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, display_name, avatar_url"),
    ]);
    if (memRes.error) console.error("Branch members fetch error:", memRes.error.message);
    if (reqRes.error) console.error("Join requests fetch error:", reqRes.error.message);
    setMembers(memRes.data || []);
    setRequests(reqRes.data || []);
    setProfiles(profilesByUserId(profRes.data));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const roster = useMemo(
    () => buildMemberRoster(members, requests, branchIds, profiles),
    [members, requests, branchIds, profiles],
  );
  const pending = useMemo(() => pendingJoinRequests(requests, branchIds), [requests, branchIds]);

  const showBranchBadge = branchIds.length !== 1 && (branches?.length || 0) > 1;

  const reload = () => {
    load();
    onChange?.();
  };

  /**
   * Create the sign-in for someone who is a member but has no account yet.
   * There is no self sign-up, so this is how an approved member gets in. Only
   * super admins may — the account service checks the role server-side — and
   * the generated password is shown once so it can be shared securely.
   */
  const createSignIn = async (
    email: string,
    name: string,
    branchId?: string,
  ): Promise<"created" | "exists" | "denied" | "failed"> => {
    if (!isSuperAdmin) return "denied";
    const password = generatePassword();
    const result = await callAdminUsersApi({ action: "create", email, password, resetIfExists: true });
    if (result.error) {
      toast({ title: "Could not create the sign-in", description: result.error, variant: "destructive" });
      return "failed";
    }
    // Link the account to the branch now, so the member shows as signed up.
    if (branchId && result.userId) {
      const { data: existing } = await supabase
        .from("branch_members")
        .select("id")
        .eq("branch_id", branchId)
        .eq("user_id", result.userId)
        .maybeSingle();
      if (!existing) {
        const { error: linkError } = await supabase
          .from("branch_members")
          .insert({ branch_id: branchId, user_id: result.userId, role: "member", has_login: true });
        if (linkError) console.warn("Could not link member to branch:", linkError.message);
      }
    }
    toast({
      title: "Sign-in created",
      description: `${name} can sign in with ${email} — password: ${password}. Share it securely and ask them to change it after signing in.`,
      duration: 60000,
    });
    return "created";
  };

  const setRequestStatus = async (id: string, status: "approved" | "rejected") => {
    const request = requests.find((r) => r.id === id);
    setBusyId(id);
    const { error } = await supabase.from("membership_requests").update({ status }).eq("id", id);
    setBusyId(null);
    if (error) {
      toast({ title: "Could not update the request", description: error.message, variant: "destructive" });
      return;
    }
    reload();
    if (status === "rejected") {
      toast({ title: "Request rejected" });
      return;
    }
    toast({ title: "Member approved" });
    if (request?.email) {
      const outcome = await createSignIn(request.email, memberDisplayName(request), request.branch_id);
      if (outcome === "denied") {
        toast({
          title: "Sign-in still needed",
          description: "A super admin creates the sign-in from Admin \u2192 Members.",
        });
      } else if (outcome === "exists") {
        toast({
          title: "Already has a sign-in",
          description: `${request.email} can sign in with their existing password; the branch membership is linked automatically.`,
        });
      }
    }
    reload();
  };

  /** A member added by an admin is an already-approved join request. */
  const handleAddMember = async () => {
    const branchId = form.branchId || defaultBranchId;
    if (!branchId) {
      toast({ title: "Choose a branch", variant: "destructive" });
      return;
    }
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("membership_requests").insert({
      branch_id: branchId,
      full_name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      message: form.note.trim() || null,
      status: "approved",
    });
    setSaving(false);
    if (error) {
      toast({ title: "Could not add member", description: error.message, variant: "destructive" });
      return;
    }
    setAddOpen(false);
    const addedName = form.name.trim();
    const addedEmail = form.email.trim().toLowerCase();
    setForm(emptyForm(defaultBranchId));
    reload();
    toast({ title: "Member added", description: `${addedName} is now a member of this branch.` });
    const outcome = await createSignIn(addedEmail, addedName);
    if (outcome === "denied") {
      toast({ description: "A super admin can create their sign-in from the roster." });
    } else if (outcome === "exists") {
      toast({
        title: "Already has a sign-in",
        description: `${addedEmail} can sign in with their existing password; the branch membership is linked automatically.`,
      });
    }
  };

  const handleRoleChange = async (member: RosterMember, role: string) => {
    setBusyId(member.id);
    const { error } = await supabase.from("branch_members").update({ role }).eq("id", member.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Could not change the role", description: error.message, variant: "destructive" });
      return;
    }
    reload();
    toast({ title: `Role set to ${roleLabel(role)}` });
  };

  const handleRemove = async (member: RosterMember) => {
    setBusyId(member.id);
    const table = member.source === "account" ? "branch_members" : "membership_requests";
    const { error } = await supabase.from(table).delete().eq("id", member.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Could not remove member", description: error.message, variant: "destructive" });
      return;
    }
    reload();
    toast({ title: `${member.name} removed from the branch` });
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Pending join requests ───────────────────────────────── */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Join Requests
            <Badge className="ml-2 bg-amber-100 text-amber-800 border-transparent">{pending.length} waiting</Badge>
          </h2>
          <div className="grid gap-3">
            {pending.map((req) => (
              <Card key={req.id} className="border-amber-200 bg-amber-50/50">
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{memberDisplayName(req)}</p>
                      {showBranchBadge && (
                        <Badge variant="outline" className="text-xs">{branchNameFor(branches, req.branch_id)}</Badge>
                      )}
                    </div>
                    {req.email && <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{req.email}</p>}
                    {req.phone && <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{req.phone}</p>}
                    {req.message && <p className="text-sm text-muted-foreground italic mt-1">"{req.message}"</p>}
                    <p className="text-xs text-muted-foreground mt-1">Requested {format(new Date(req.created_at), "PP")}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={busyId === req.id}
                      onClick={() => setRequestStatus(req.id, "approved")}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      disabled={busyId === req.id}
                      onClick={() => setRequestStatus(req.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── Members ─────────────────────────────────────────────── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold">
            Branch Members ({roster.length})
          </h2>
          <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setForm(emptyForm(defaultBranchId)); }}>
            <DialogTrigger asChild>
              <Button disabled={!(branches || []).length}>
                <UserPlus className="h-4 w-4 mr-2" /> Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add a branch member</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select
                    value={form.branchId || defaultBranchId}
                    onValueChange={(v) => setForm({ ...form, branchId: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Choose a branch" /></SelectTrigger>
                    <SelectContent>
                      {(branches || []).map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name || "Branch"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-member-name">Full Name *</Label>
                  <Input id="new-member-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Member's full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-member-email">Email *</Label>
                  <Input id="new-member-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-member-phone">Phone (Optional)</Label>
                  <Input id="new-member-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-member-note">Note (Optional)</Label>
                  <Textarea id="new-member-note" rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Anything the branch should know about this member" />
                </div>
                <p className="text-xs text-muted-foreground">
                  The member is added immediately. If they have no account yet, a super admin can create their sign-in from the roster — the password is shown once to share securely.
                </p>
                <Button onClick={handleAddMember} className="w-full" disabled={saving}>
                  <Plus className="h-4 w-4 mr-2" /> {saving ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {roster.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                {branchIds.length === 0
                  ? "You have not been assigned a branch yet. A Super Admin can assign one in Admin \u2192 Branch Admins."
                  : "No members yet. Add one, or approve a join request from this branch."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {roster.map((member) => (
              <Card key={member.key}>
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{member.name}</p>
                        {showBranchBadge && (
                          <Badge variant="outline" className="text-xs">{branchNameFor(branches, member.branchId)}</Badge>
                        )}
                        {member.source === "request" ? (
                          <Badge className="bg-blue-100 text-blue-800 border-transparent text-xs">Approved request</Badge>
                        ) : member.awaitingSignUp ? (
                          <Badge className="bg-blue-100 text-blue-800 border-transparent text-xs">No account yet</Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {[member.email, member.phone].filter(Boolean).join(" · ") || roleLabel(member.role)}
                        {member.joinedAt ? ` · joined ${format(new Date(member.joinedAt), "PP")}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {member.source === "account" ? (
                      <Select
                        value={member.role}
                        onValueChange={(v) => handleRoleChange(member, v)}
                        disabled={busyId === member.id}
                      >
                        <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r} value={r}>{roleLabel(r)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 border-transparent">Approved</Badge>
                    )}
                    {member.source === "request" && member.awaitingSignUp && member.email && isSuperAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === member.id}
                        onClick={async () => {
                          setBusyId(member.id);
                          await createSignIn(member.email, member.name, member.branchId);
                          setBusyId(null);
                          reload();
                        }}
                      >
                        <KeyRound className="h-4 w-4 mr-1" /> Create sign-in
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      disabled={busyId === member.id}
                      onClick={() => handleRemove(member)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BranchMembersPanel;
