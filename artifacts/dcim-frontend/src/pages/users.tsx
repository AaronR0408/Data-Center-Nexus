import React, { useState } from "react";
import {
  useListUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  getListUsersQueryKey,
  UserRole,
  type UserInput,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ShieldCheck, Users as UsersIcon } from "lucide-react";
import { useLocation } from "wouter";

const ROLE_STYLES: Record<string, string> = {
  ADMIN:    "text-red-400 border-red-500/30 bg-red-500/10",
  ENGINEER: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  VIEWER:   "text-blue-400 border-blue-500/30 bg-blue-500/10",
};

const blankForm = (): UserInput => ({ username: "", password: "", role: UserRole.VIEWER });

export default function Users() {
  const { isAdmin, user: currentUser } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<UserInput>(blankForm());
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<UserInput>(blankForm());
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: users = [], isLoading } = useListUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <ShieldCheck className="h-12 w-12 text-muted-foreground/30" />
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Access denied — ADMIN role required
        </p>
        <Button variant="outline" size="sm" className="font-mono text-xs" onClick={() => navigate("/")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(
      { data: form },
      {
        onSuccess: () => {
          toast({ title: "User Created", description: `${form.username} (${form.role}) added.` });
          setIsCreateOpen(false);
          setForm(blankForm());
          invalidate();
        },
        onError: (err: unknown) => {
          const msg = (err as { message?: string })?.message ?? "Could not create user.";
          toast({ title: "Create Failed", description: msg, variant: "destructive" });
        },
      }
    );
  };

  const openEdit = (id: number, u: UserInput) => {
    setEditId(id);
    setEditForm({ ...u, password: "" });
    setSheetOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    updateUser.mutate(
      { id: editId, data: editForm },
      {
        onSuccess: () => {
          toast({ title: "User Updated" });
          setSheetOpen(false);
          invalidate();
        },
        onError: () => toast({ title: "Update Failed", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number, username: string) => {
    if (currentUser?.id === id) {
      toast({ title: "Cannot delete yourself", variant: "destructive" });
      return;
    }
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    deleteUser.mutate({ id }, {
      onSuccess: () => { toast({ title: "User Deleted" }); invalidate(); },
    });
  };

  const UserForm = ({
    f,
    setF,
    isEdit,
  }: {
    f: UserInput;
    setF: (v: UserInput) => void;
    isEdit?: boolean;
  }) => (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Username</Label>
        <Input
          value={f.username}
          onChange={e => setF({ ...f, username: e.target.value })}
          required
          className="font-mono bg-background"
          placeholder="jsmith"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Password{isEdit && " (leave blank to keep current)"}
        </Label>
        <Input
          type="password"
          value={f.password ?? ""}
          onChange={e => setF({ ...f, password: e.target.value })}
          required={!isEdit}
          className="font-mono bg-background"
          placeholder={isEdit ? "••••••••" : ""}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Role</Label>
        <Select value={f.role} onValueChange={v => setF({ ...f, role: v as UserRole })}>
          <SelectTrigger className="font-mono bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.values(UserRole).map(r => (
              <SelectItem key={r} value={r} className="font-mono">{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const engineerCount = users.filter(u => u.role === "ENGINEER").length;
  const viewerCount = users.filter(u => u.role === "VIEWER").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">User Management</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1 uppercase tracking-widest">ACCESS CONTROL</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono uppercase tracking-wider text-xs">
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase tracking-widest text-primary">Add User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <UserForm f={form} setF={setForm} />
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={createUser.isPending} className="font-mono uppercase tracking-wider text-xs">
                  {createUser.isPending ? "Creating…" : "Add User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Admins", count: adminCount, style: "text-red-400" },
          { label: "Engineers", count: engineerCount, style: "text-amber-400" },
          { label: "Viewers", count: viewerCount, style: "text-blue-400" },
        ].map(k => (
          <div key={k.label} className="rounded-md border border-border bg-card/50 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k.label}</p>
              <p className={`text-2xl font-bold font-mono mt-1 ${k.style}`}>{k.count}</p>
            </div>
            <UsersIcon className="h-4 w-4 text-muted-foreground/30" />
          </div>
        ))}
      </div>

      {/* User list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground font-mono text-xs uppercase tracking-widest">
          Loading users…
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="border-b border-border">
                <th className="font-mono text-xs uppercase tracking-wider text-left px-4 py-3 text-muted-foreground">ID</th>
                <th className="font-mono text-xs uppercase tracking-wider text-left px-4 py-3 text-muted-foreground">Username</th>
                <th className="font-mono text-xs uppercase tracking-wider text-left px-4 py-3 text-muted-foreground">Role</th>
                <th className="font-mono text-xs uppercase tracking-wider text-right px-4 py-3 text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{u.id}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-sm">{u.username}</span>
                    {currentUser?.id === u.id && (
                      <span className="ml-2 font-mono text-[10px] text-primary border border-primary/30 bg-primary/10 px-1.5 py-0.5 rounded">you</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-[10px] px-2 py-1 border rounded uppercase tracking-widest ${ROLE_STYLES[u.role] ?? ""}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(u.id, { username: u.username, password: "", role: u.role as UserRole })}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(u.id, u.username)}
                        disabled={currentUser?.id === u.id}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] bg-card border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-mono uppercase tracking-widest text-primary">Edit User</SheetTitle>
            <SheetDescription className="font-mono text-xs text-muted-foreground">#{editId}</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleUpdate}>
            <UserForm f={editForm} setF={setEditForm} isEdit />
            <div className="pt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSheetOpen(false)} className="font-mono text-xs uppercase tracking-wider">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={updateUser.isPending} className="font-mono text-xs uppercase tracking-wider">
                {updateUser.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
