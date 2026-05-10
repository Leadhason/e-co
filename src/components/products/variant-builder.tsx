"use client";

import { useState, useEffect } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";

export function VariantBuilder({ 
  basePrice, 
  attributes, 
  setAttributes, 
  variants, 
  setVariants 
}: { 
  basePrice: string; 
  attributes: any[]; 
  setAttributes: (attrs: any[]) => void; 
  variants: any[]; 
  setVariants: (vars: any[]) => void;
}) {
  
  const addAttribute = () => {
    setAttributes([...attributes, { id: Math.random().toString(), name: "", options: [] }]);
  };

  const updateAttributeName = (id: string, name: string) => {
    setAttributes(attributes.map(a => a.id === id ? { ...a, name } : a));
  };

  const addOption = (attrId: string, optionValue: string) => {
    setAttributes(attributes.map(a => {
      if (a.id === attrId && optionValue && !a.options.includes(optionValue)) {
        return { ...a, options: [...a.options, optionValue] };
      }
      return a;
    }));
  };

  const removeOption = (attrId: string, optionValue: string) => {
    setAttributes(attributes.map(a => {
      if (a.id === attrId) {
        return { ...a, options: a.options.filter((o: string) => o !== optionValue) };
      }
      return a;
    }));
  };

  const removeAttribute = (id: string) => {
    setAttributes(attributes.filter(a => a.id !== id));
  };

  // Re-compute variants when attributes change
  useEffect(() => {
    if (attributes.length === 0) {
      setVariants([]);
      return;
    }

    // Only include attributes that have a name and at least one option
    const validAttributes = attributes.filter(a => a.name.trim() !== "" && a.options.length > 0);
    
    if (validAttributes.length === 0) {
      setVariants([]);
      return;
    }

    // Helper to generate cartesian product
    const cartesian = (arrays: any[][]) => {
      return arrays.reduce((acc, curr) => {
        return acc.flatMap(c => curr.map(n => [...c, n]));
      }, [[]] as any[][]);
    };

    const optionsArrays = validAttributes.map(a => a.options.map((opt: string) => ({ [a.name]: opt })));
    const combinations = cartesian(optionsArrays);

    const newVariants = combinations.map(combo => {
      const optionMap = Object.assign({}, ...combo);
      const generatedSku = Object.values(optionMap).map(v => String(v).substring(0, 3).toUpperCase()).join('-');
      
      // Try to preserve existing variant data (price, stock) if options match exactly
      const existing = variants.find(v => JSON.stringify(v.options) === JSON.stringify(optionMap));

      return {
        id: existing?.id || Math.random().toString(),
        options: optionMap,
        sku: existing?.sku || generatedSku,
        priceOverride: existing?.priceOverride || "",
        stockQty: existing?.stockQty || 0,
        isActive: existing !== undefined ? existing.isActive : true
      };
    });

    setVariants(newVariants);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributes]); // omitting variants from deps to avoid infinite looping

  const updateVariant = (id: string, field: string, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {attributes.map((attr) => (
          <div key={attr.id} className="bg-bg-tertiary border border-border-default rounded-[8px] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1 w-full max-w-[240px]">
                <label className="text-[11px] font-mono uppercase text-text-muted">Option Name</label>
                <input 
                  type="text" 
                  value={attr.name} 
                  onChange={(e) => updateAttributeName(attr.id, e.target.value)}
                  placeholder="e.g. Size or Color" 
                  className="h-[32px] px-3 border border-border-strong rounded-[6px] text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary"
                />
              </div>
              <button 
                type="button" 
                onClick={() => removeAttribute(attr.id)}
                className="p-1 text-text-muted hover:text-[#A32D2D] transition-colors mt-5"
              >
                <IconTrash size={16} />
              </button>
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[11px] font-mono uppercase text-text-muted">Values</label>
              <div className="flex flex-wrap gap-2 items-center">
                {attr.options.map((opt: string) => (
                  <div key={opt} className="flex items-center gap-1 bg-bg-primary border border-border-default px-2 py-1 rounded-[5px]">
                    <span className="text-[12px] text-text-primary">{opt}</span>
                    <button type="button" onClick={() => removeOption(attr.id, opt)} className="text-text-muted hover:text-[#A32D2D]"><IconTrash size={12} /></button>
                  </div>
                ))}
                <input 
                  type="text"
                  placeholder="Add value + Enter"
                  className="h-[28px] w-[140px] px-2 text-[12px] bg-transparent border border-dashed border-border-strong rounded-[5px] focus:outline-none focus:border-text-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addOption(attr.id, e.currentTarget.value.trim());
                      e.currentTarget.value = '';
                    }
                  }}
                  onBlur={(e) => {
                    if (e.currentTarget.value.trim()) {
                      addOption(attr.id, e.currentTarget.value.trim());
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <button 
          type="button" 
          onClick={addAttribute}
          className="self-start flex items-center gap-1.5 px-3 h-[32px] bg-transparent border border-border-default text-text-secondary text-[12px] font-medium rounded-[7px] hover:border-text-hint hover:text-text-primary transition-all"
        >
          <IconPlus size={14} /> Add another option
        </button>
      </div>

      {variants.length > 0 && (
        <div className="flex flex-col gap-3 pt-4 border-t border-border-default">
          <label className="text-[11px] font-mono uppercase text-text-primary">Preview Variants</label>
          <div className="border border-border-default bg-bg-primary rounded-[8px] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-bg-tertiary border-b border-border-default">
                  <th className="font-normal text-[11px] text-text-muted px-4 py-2 w-10">Active</th>
                  <th className="font-normal text-[11px] text-text-muted px-4 py-2">Variant</th>
                  <th className="font-normal text-[11px] text-text-muted px-4 py-2">Price (₵)</th>
                  <th className="font-normal text-[11px] text-text-muted px-4 py-2">Stock</th>
                  <th className="font-normal text-[11px] text-text-muted px-4 py-2">SKU</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant.id} className={`border-b border-border-subtle last:border-b-0 ${!variant.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={variant.isActive}
                        onChange={(e) => updateVariant(variant.id, 'isActive', e.target.checked)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-[12px] text-text-primary font-medium">
                      {Object.values(variant.options).join(' / ')}
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" 
                        value={variant.priceOverride}
                        onChange={(e) => updateVariant(variant.id, 'priceOverride', e.target.value)}
                        placeholder={`Base: ${basePrice || '0'}`}
                        step="any"
                        className="w-24 h-[28px] px-2 text-[12px] font-mono border border-border-default rounded-[5px] focus:outline-none focus:border-text-primary"
                        disabled={!variant.isActive}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" 
                        value={variant.stockQty || ''}
                        onChange={(e) => updateVariant(variant.id, 'stockQty', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-20 h-[28px] px-2 text-[12px] font-mono border border-border-default rounded-[5px] focus:outline-none focus:border-text-primary"
                        disabled={!variant.isActive}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        value={variant.sku}
                        onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                        className="w-32 h-[28px] px-2 text-[12px] font-mono border border-border-default rounded-[5px] focus:outline-none focus:border-text-primary uppercase"
                        disabled={!variant.isActive}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
