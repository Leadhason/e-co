"use client";

import { useState } from "react";
import { 
  IconPlus, 
  IconTruck, 
  IconTrash, 
  IconMapPin, 
  IconCircleCheck, 
  IconCircleX,
  IconPencil
} from "@tabler/icons-react";

import { createShippingZone, deleteShippingZone, updateShippingZone } from "@/actions/shipping";

export function ZoneList({ initialZones }: { initialZones: any[] }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    
    let res;
    if (editingZone) {
      res = await updateShippingZone(editingZone.id, formData);
    } else {
      res = await createShippingZone(formData);
    }

    setIsPending(false);
    if (res.success) {
      setShowAddForm(false);
      setEditingZone(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this shipping zone?")) return;
    const res = await deleteShippingZone(id);
    if (!res.success) {
      alert(res.error || "Failed to delete shipping zone.");
    }
  }


  function handleEdit(zone: any) {
    setEditingZone(zone);
    setShowAddForm(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button 
          onClick={() => {
            if (showAddForm) {
              setShowAddForm(false);
              setEditingZone(null);
            } else {
              setShowAddForm(true);
            }
          }}
          className="flex items-center gap-2 px-3 h-[32px] bg-text-primary text-bg-primary rounded-[7px] text-[12px] font-medium hover:bg-black transition-all"
        >
          {showAddForm ? "Cancel" : <><IconPlus size={14} /> Add Shipping Zone</>}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-bg-secondary border border-border-default rounded-[10px] p-[20px] animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase text-text-muted">Zone Name</label>
              <input name="name" defaultValue={editingZone?.name} required placeholder="e.g. Greater Accra" className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none bg-bg-primary focus:border-text-primary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase text-text-muted">Flat Rate (₵)</label>
              <input name="flatRate" type="number" step="0.01" defaultValue={editingZone?.flatRate} required placeholder="25.00" className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none bg-bg-primary focus:border-text-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase text-text-muted">Free Threshold (₵ - Optional)</label>
              <input name="freeThreshold" type="number" step="0.01" defaultValue={editingZone?.freeThreshold} placeholder="500.00" className="h-[36px] px-3 border border-border-strong rounded-[7px] text-[13px] outline-none bg-bg-primary focus:border-text-primary" />
            </div>
            <div className="flex items-center gap-6 pt-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" name="codEnabled" id="zone-cod" defaultChecked={editingZone?.codEnabled} className="w-4 h-4 rounded border-border-strong" />
                <label htmlFor="zone-cod" className="text-[13px] text-text-primary">Enable COD</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isDefault" id="zone-default" defaultChecked={editingZone?.isDefault} className="w-4 h-4 rounded border-border-strong" />
                <label htmlFor="zone-default" className="text-[13px] text-text-primary font-medium text-[#185FA5]">Set as Default</label>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-[11px] font-mono uppercase text-text-muted">Regions / Cities (Comma separated)</label>
            <textarea name="regions" required defaultValue={editingZone?.regions.map((r: any) => r.regionName).join(", ")} placeholder="Accra Central, Tema, East Legon..." className="p-3 border border-border-strong rounded-[7px] text-[13px] outline-none bg-bg-primary focus:border-text-primary min-h-[80px]" />
          </div>
          <div className="flex justify-end">
            <button disabled={isPending} className="px-[16px] h-[36px] bg-text-primary text-bg-primary rounded-[7px] text-[12px] font-medium hover:bg-black disabled:opacity-50 transition-all">
              {isPending ? "Saving..." : (editingZone ? "Update Zone" : "Save Zone")}
            </button>
          </div>
        </form>
      )}


      <div className="grid grid-cols-1 gap-4">
        {initialZones.map((zone) => (
          <div key={zone.id} className="bg-bg-primary border border-border-default rounded-[10px] p-[20px] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-border-strong transition-colors">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center text-text-muted">
                  <IconTruck size={18} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-medium text-text-primary">{zone.name}</h3>
                    {zone.isDefault && (

                      <span className="text-[9px] font-mono uppercase bg-[#E8F1FC] text-[#185FA5] px-1.5 py-0.5 rounded-[4px] font-bold border border-[#C5D9F1]">Default</span>
                    )}
                  </div>
                  <p className="text-[12px] text-text-muted font-mono">
                    Rate: ₵{zone.flatRate.toLocaleString()} 
                    {zone.freeThreshold && ` • Free over ₵${zone.freeThreshold.toLocaleString()}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {zone.regions.map((r: any) => (
                  <span key={r.id} className="inline-flex items-center gap-1 text-[10px] bg-bg-secondary border border-border-subtle px-1.5 py-0.5 rounded-[4px] text-text-secondary">
                    <IconMapPin size={10} />
                    {r.regionName}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] uppercase font-mono text-text-muted tracking-wider">COD Status</span>
                {zone.codEnabled ? (
                   <span className="text-[11px] text-[#0F6E56] flex items-center gap-1 font-medium">
                     <IconCircleCheck size={14} /> Available
                   </span>
                ) : (
                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <IconCircleX size={14} /> Disabled
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEdit(zone)}
                  className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-[8px] transition-all"
                >
                  <IconPencil size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(zone.id)}
                  className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-[#A32D2D] hover:bg-[#FCEBEB] rounded-[8px] transition-all"
                >
                  <IconTrash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {initialZones.length === 0 && (
          <div className="p-12 border-2 border-dashed border-border-default rounded-[12px] flex flex-col items-center justify-center text-center">
            <IconTruck size={32} className="text-text-hint mb-3" />
            <p className="text-[13px] text-text-secondary">No shipping zones defined yet.</p>
            <p className="text-[11px] text-text-muted mt-1">Add your first zone to enable regional shipping rates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
