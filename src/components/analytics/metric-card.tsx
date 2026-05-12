import { IconArrowUpRight, IconArrowDownRight, IconMinus } from "@tabler/icons-react";

export function MetricCard({ 
  label, 
  value, 
  prevValue,
  type = "number",
  isNeutral = false
}: { 
  label: string; 
  value: string; 
  prevValue?: number;
  type?: "number" | "currency";
  isNeutral?: boolean;
}) {
  let delta = 0;
  if (prevValue !== undefined && prevValue > 0) {
    const currentVal = parseFloat(value.replace(/₵|,/g, ""));
    delta = ((currentVal - prevValue) / prevValue) * 100;
  }

  const isPositive = delta > 0;
  const isZero = delta === 0 || isNeutral;

  return (
    <div className="bg-bg-primary border border-border-default rounded-[10px] p-[16px] px-[20px] flex flex-col gap-1">
      <span className="text-[11px] font-mono font-medium text-text-muted uppercase tracking-wider">{label}</span>
      <div className="flex items-end justify-between">
        <span className="text-[22px] font-medium text-text-primary tracking-[-0.02em]">{value}</span>
        
        {prevValue !== undefined && !isNeutral && (
          <div className={`flex items-center gap-0.5 text-[11px] font-mono font-medium ${
            isZero ? "text-text-muted" : isPositive ? "text-[#3B6D11]" : "text-[#A32D2D]"
          }`}>
            {isZero ? (
              <IconMinus size={14} />
            ) : isPositive ? (
              <IconArrowUpRight size={14} stroke={2.5} />
            ) : (
              <IconArrowDownRight size={14} stroke={2.5} />
            )}
            {!isZero && `${Math.abs(Math.round(delta))}%`}
          </div>
        )}
      </div>
    </div>
  );
}
