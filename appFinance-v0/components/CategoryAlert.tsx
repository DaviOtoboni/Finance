'use client';

interface CategoryAlertProps {
  category: string;
  spent: number;
  limit: number;
  isExceeded: boolean;
}

export default function CategoryAlert({ category, spent, limit, isExceeded }: CategoryAlertProps) {
  const percentage = (spent / limit) * 100;
  
  return (
    <div className={`rounded-lg p-3 border border-neutral-300 bg-neutral-100`}> {/* borda e fundo neutros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Ícone removido para ficar mais discreto */}
          <div>
            <h4 className="font-normal text-neutral-700">{category}</h4>
            <p className="text-xs text-neutral-500">
              R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-normal text-neutral-500">
            {percentage.toFixed(1)}%
          </div>
        </div>
      </div>
      <div className="mt-2">
        <div className="bg-neutral-200 rounded-full h-1">
          <div 
            className="h-1 rounded-full bg-neutral-400" // barra de progresso neutra
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 