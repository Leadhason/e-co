export function BreakdownTable({ 
  title, 
  items 
}: { 
  title: string; 
  items: { label: string; value: string; meta?: string }[] 
}) {
  return (
    <div className="bg-bg-primary border border-border-default rounded-[10px] overflow-hidden flex flex-col">
      <div className="p-[14px] px-[20px] border-b border-border-default">
        <h2 className="text-[13px] font-medium text-text-primary">{title}</h2>
      </div>
      <div className="flex flex-col">
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-center justify-between px-[20px] py-[12px] border-b border-border-subtle last:border-b-0 hover:bg-bg-tertiary transition-colors"
          >
            <div className="flex flex-col">
              <span className="text-[13px] text-text-primary">{item.label}</span>
              {item.meta && <span className="text-[11px] text-text-muted font-mono uppercase tracking-tight">{item.meta}</span>}
            </div>
            <span className="text-[13px] font-mono font-medium text-text-primary">{item.value}</span>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-[12px] text-text-muted italic">No data available for this period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
