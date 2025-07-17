'use client';

interface ExpenseCardProps {
  title: string;
  amount: number;
  icon: string;
  color: string;
}

export default function ExpenseCard({ title, amount, icon, color }: ExpenseCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <i className={`${icon} text-white text-xl`}></i>
        </div>
      </div>
    </div>
  );
} 