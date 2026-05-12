'use client'

import { useState } from "react";
import { 
  IconUserPlus, 
  IconLock, 
  IconLockOpen, 
  IconTrash, 
  IconMail,
  IconX,
  IconCheck
} from "@tabler/icons-react";
import { createAdminUser, deleteAdminUser, updateAdminStatus } from "@/actions/settings";

export function TeamList({ admins }: { admins: any[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusToggle(id: string, currentStatus: boolean) {
    setIsPending(true);
    const res = await updateAdminStatus(id, !currentStatus);
    setIsPending(false);
    if (!res.success) alert(res.error || "Failed to update status.");
  }

  async function handleDelete(id: string) {

    if (!confirm("Are you sure you want to permanently delete this account? This action cannot be undone.")) return;
    
    setIsPending(true);
    const res = await deleteAdminUser(id);
    setIsPending(false);
    
    if (!res.success) {
      alert(res.error || "Failed to delete user.");
    }
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();
    setIsPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await createAdminUser(formData);
    setIsPending(false);
    if (res.success) {
      setShowAddModal(false);
    } else {
      setError(res.error || "Failed to create employee.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3 h-[32px] bg-text-primary text-bg-primary rounded-[7px] text-[12px] font-medium hover:bg-black transition-all"
        >
          <IconUserPlus size={14} />
          Add Employee
        </button>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-primary border border-border-default rounded-[12px] w-full max-w-[400px] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
             <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                <h3 className="text-[14px] font-medium text-text-primary">Add New Employee</h3>
                <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary"><IconX size={18} /></button>
             </div>
             <form onSubmit={handleAdd} className="p-5 flex flex-col gap-4">
                {error && <div className="p-3 bg-[#FCEBEB] text-[#A32D2D] text-[11px] rounded-[6px] border border-[#F2D1D1]">{error}</div>}
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono uppercase text-text-muted">Full Name</label>
                  <input name="name" required className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" placeholder="Jane Doe" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono uppercase text-text-muted">Email Address</label>
                  <input name="email" type="email" required className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" placeholder="jane@stonebase.com" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono uppercase text-text-muted">Temporary Password</label>
                  <input name="password" type="password" required className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none focus:border-text-primary" placeholder="Min 6 characters" />
                </div>

                <input type="hidden" name="role" value="EMPLOYEE" />

                <div className="pt-4 flex justify-end gap-2">
                   <button type="button" onClick={() => setShowAddModal(false)} className="px-4 h-[36px] text-[12px] font-medium text-text-secondary hover:text-text-primary transition-all">Cancel</button>
                   <button disabled={isPending} className="px-4 h-[36px] bg-text-primary text-bg-primary rounded-[7px] text-[12px] font-medium hover:bg-black disabled:opacity-50 transition-all">
                     {isPending ? "Creating..." : "Create Account"}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}


      <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-bg-secondary border-b border-border-default">
              <th className="font-normal text-[11px] text-text-muted px-[20px] py-[10px] uppercase tracking-wider">Name</th>
              <th className="font-normal text-[11px] text-text-muted px-[20px] py-[10px] uppercase tracking-wider">Role</th>
              <th className="font-normal text-[11px] text-text-muted px-[20px] py-[10px] uppercase tracking-wider">Status</th>
              <th className="font-normal text-[11px] text-text-muted px-[20px] py-[10px] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-bg-tertiary transition-colors">
                <td className="px-[20px] py-[12px]">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-text-primary">{admin.name}</span>
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      <IconMail size={10} /> {admin.email}
                    </span>
                  </div>
                </td>
                <td className="px-[20px] py-[12px]">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] border ${
                    admin.role === 'OWNER' ? 'bg-[#F0EDE8] border-border-default text-text-primary' : 'bg-bg-secondary border-border-subtle text-text-secondary'
                  }`}>
                    {admin.role}
                  </span>
                </td>
                <td className="px-[20px] py-[12px]">
                  {admin.isBlocked ? (
                    <span className="text-[11px] text-[#A32D2D] flex items-center gap-1 font-medium">
                      <IconLock size={12} /> Blocked
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#0F6E56] flex items-center gap-1 font-medium">
                      <IconLockOpen size={12} /> Active
                    </span>
                  )}
                </td>
                <td className="px-[20px] py-[12px] text-right">
                  <div className="flex items-center justify-end gap-2">
                    {admin.role !== 'OWNER' && (
                      <>
                        <button 
                          onClick={() => handleStatusToggle(admin.id, admin.isBlocked)}
                          disabled={isPending}
                          className={`w-8 h-8 flex items-center justify-center rounded-[6px] transition-all ${
                            admin.isBlocked 
                              ? "text-[#A32D2D] bg-[#FCEBEB] hover:bg-[#F2D1D1]" 
                              : "text-text-muted hover:text-text-primary hover:bg-bg-secondary"
                          }`}
                          title={admin.isBlocked ? "Unblock User" : "Block User"}
                        >
                          {admin.isBlocked ? <IconLockOpen size={16} /> : <IconLock size={16} />}
                        </button>

                        <button 
                          onClick={() => handleDelete(admin.id)}
                          disabled={isPending}
                          className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-[#A32D2D] hover:bg-[#FCEBEB] rounded-[6px] transition-all disabled:opacity-50"
                        >
                          <IconTrash size={16} />
                        </button>

                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
