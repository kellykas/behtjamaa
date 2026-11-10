import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStateBranches, useSubBranches } from "@/hooks/useContent";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ImageUpload";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Layers,
} from "lucide-react";

function makeSlug(name: string, stateCode: string | null, existing: string[]): string {
  let base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (stateCode && /^[a-z]{2}$/.test(stateCode)) {
    base = `${stateCode}-${base}`;
  }
  let candidate = base;
  let i = 1;
  const taken = new Set(existing);
  while (taken.has(candidate)) {
    candidate = `${base}-${i++}`;
  }
  return candidate;
}

export default function StateBranchEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast() as unknown as { toast: (props: any) => void; dismiss: (id?: string) => void; toasts: any[] };

  const { stateBranches } = useStateBranches();
  const editing = id && !id.startsWith("new");
  const parentBranch = stateBranches.find((s) => s.id === id) ?? null;

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [active, setActive] = useState(true);
  const [stateCode, setStateCode] = useState("");

  const [saving, setSaving] = useState(false);
  const [creatingChild, setCreatingChild] = useState(false);
  const [childName, setChildName] = useState("");
  const [childLocation, setChildLocation] = useState("");
  const [childDescription, setChildDescription] = useState("");

  const childSlugs = stateBranches.flatMap((s) =>
    (s as any).sub_branch_slugs ?? []
  );
  const takeChildSlug = (slug: string) => childSlugs.includes(slug);

  useEffect(() => {
    if (!editing) return;
    supabase
      .from("branches")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }: any) => {
        if (error || !data) {
          toast({ title: "Branch not found", variant: "destructive" });
          navigate("/branches");
          return;
        }
        setName(data.name);
        setLocation(data.location || "");
        setDescription(data.description || "");
        setLeaderName(data.leader_name || "");
        setLeaderEmail(data.leader_email || "");
        setPhone(data.phone || "");
        setLogoUrl(data.logo_url || "");
        setBannerUrl(data.banner_url || "");
        setActive(data.active !== false);
        setStateCode(data.state_code || "");
      });
  }, [id, navigate, toast]);

  const targetId = editing ? id : null;
  const { subBranches, loading: subLoading } = useSubBranches(targetId);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="flex items-center justify-center h-[calc(100vh - 64px)]">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-10 text-center">
            <p className="text-lg font-semibold mb-2">Access denied</p>
            <p className="text-sm text-muted-foreground mb-6">
              Only administrators can manage state branches.
            </p>
            <Button asChild variant="outline">
              <Link to="/branches">Back to Branches</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const existingSlugs = new Set(
    stateBranches.map((s) => (s as any).slug)
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const slugCandidate = makeSlug(name, stateCode.trim() || null, []);
      const slug = editing
        ? (parentBranch as any)?.slug ?? slugCandidate
        : slugCandidate;

      const payload: any = {
        name: name.trim(),
        slug,
        location: location.trim() || null,
        description: description.trim() || null,
        leader_name: leaderName.trim() || null,
        leader_email: leaderEmail.trim() || null,
        phone: phone.trim() || null,
        logo_url: logoUrl.trim() || null,
        banner_url: bannerUrl.trim() || null,
        active,
        is_state_branch: true,
        state_code: stateCode.trim() || null,
      };

      if (editing) {
        await supabase.from("branches").update(payload).eq("id", id);
      } else {
        const { data: existing } = await supabase
          .from("branches")
          .select("slug")
          .eq("slug", slug)
          .maybeSingle();
        if (existing) {
          toast({ title: "Please choose a different state name", variant: "destructive" });
          setSaving(false);
          return;
        }
        await supabase.from("branches").insert(payload);
      }

      toast({ title: editing ? "State branch updated" : "State branch created" });
      navigate("/branches");
    } catch (err: any) {
      toast({
        title: "Could not save state branch",
        description: err?.message ?? "Save failed",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddChild = async () => {
    if (!childName.trim()) {
      toast({ title: "Child branch name is required", variant: "destructive" });
      return;
    }
    if (!targetId) {
      toast({ title: "No state branch selected", variant: "destructive" });
      return;
    }
    setCreatingChild(true);
    try {
      const uniqueSuffix = Math.random().toString(36).slice(2, 6);
      const slug = makeSlug(childName, stateCode.trim() || null, [uniqueSuffix]);
      const payload: any = {
        name: childName.trim(),
        slug,
        location: childLocation.trim() || null,
        description: childDescription.trim() || null,
        parent_id: targetId,
        is_state_branch: false,
      };
      await supabase.from("branches").insert(payload);
      setChildName("");
      setChildLocation("");
      setChildDescription("");
      toast({ title: "Local chapter added" });
    } catch (err: any) {
      toast({
        title: "Could not add local chapter",
        description: err?.message ?? "Save failed",
        variant: "destructive",
      });
    } finally {
      setCreatingChild(false);
    }
  };

  const handleDeleteChild = async (childId: string) => {
    if (!targetId) return;
    await supabase.from("branches").delete().eq("id", childId);
    toast({ title: "Local chapter removed" });
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/branches">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Branches
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            {editing ? "Edit State Branch" : "Add USA State Branch"}
          </h1>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Layers className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {editing ? parentBranch?.name : "USA State Branch"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Each state gets one parent branch that owns local chapters.
                </p>
              </div>
            </div>
          </CardHeader>

          <div className="space-y-4 p-4 pt-2">
            <div>
              <Label htmlFor="state-name">State name</Label>
              <Input
                id="state-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. New York"
                required
              />
            </div>
            <div>
              <Label htmlFor="state-code">State code</Label>
              <Input
                id="state-code"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                placeholder="e.g. NY (optional)"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for slugs and sorting. Leave blank to auto-derive from the name.
              </p>
            </div>
            <div>
              <Label htmlFor="state-location">Location</Label>
              <Input
                id="state-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New York, USA"
              />
            </div>
            <div>
              <Label htmlFor="state-desc">Description</Label>
              <Textarea
                id="state-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="State-wide mission summary shown on the state page."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state-leader">State leader name</Label>
                <Input
                  id="state-leader"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label htmlFor="state-email">State leader email</Label>
                <Input
                  id="state-email"
                  type="email"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state-phone">Phone</Label>
                <Input
                  id="state-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label htmlFor="state-active">Active</Label>
                <Button
                  variant={active ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setActive(!active)}
                  type="button"
                >
                  {active ? "Active" : "Inactive"}
                </Button>
              </div>
            </div>

            <ImageUpload
              id="state-logo"
              label="Logo"
              value={logoUrl}
              onChange={setLogoUrl}
              preview="avatar"
              folder="branches"
            />
            <ImageUpload
              id="state-banner"
              label="Banner"
              value={bannerUrl}
              onChange={setBannerUrl}
              preview="banner"
              folder="branches"
            />
          </div>

          <div className="flex justify-end gap-3 p-4 pt-2 border-t">
            <Button variant="ghost" onClick={() => navigate("/branches")} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {editing ? "Save State Branch" : "Create State Branch"}
            </Button>
          </div>
        </Card>

        <Card className="mt-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">Local Chapters</h2>
                  <p className="text-xs text-muted-foreground">
                    Sub-branches under this state.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreatingChild(!creatingChild)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Chapter
              </Button>
            </div>
          </CardHeader>

          {creatingChild && (
            <div className="p-4 border rounded-lg bg-muted/40 space-y-3">
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="child-name">Chapter name</Label>
                  <Input
                    id="child-name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Brooklyn Chapter"
                  />
                </div>
                <div>
                  <Label htmlFor="child-location">Location</Label>
                  <Input
                    id="child-location"
                    value={childLocation}
                    onChange={(e) => setChildLocation(e.target.value)}
                    placeholder="e.g. Brooklyn, NY"
                  />
                </div>
                <div>
                  <Label htmlFor="child-desc">Description</Label>
                  <Textarea
                    id="child-desc"
                    value={childDescription}
                    onChange={(e) => setChildDescription(e.target.value)}
                    rows={2}
                    placeholder="Short note for this local chapter."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setCreatingChild(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddChild}>
                  Save Chapter
                </Button>
              </div>
            </div>
          )}

          <div className="p-4 space-y-3">
            {subLoading ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Loading chapters...
              </div>
            ) : subBranches.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                No local chapters yet.
              </div>
            ) : (
              subBranches.map((child: any) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{child.name}</p>
                    {child.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" /> {child.location}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/branches/${parentBranch?.slug ?? ""}/${(child as any).slug}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => handleDeleteChild(child.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
