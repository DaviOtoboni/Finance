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
    <div className="rounded-lg p-3 border border-red-300 bg-red-50"> {/* aviso vermelho */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-red-700">
            R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-normal text-red-700">
            {percentage.toFixed(1)}%
          </div>
        </div>
      </div>
      <div className="mt-2">
        <div className="bg-red-100 rounded-full h-1">
          <div 
            className="h-1 rounded-full bg-red-400"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 